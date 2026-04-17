from cross_lib.conexao.api.sigitmti.bd import consulta_bd, nota_bd
from repositories.bd_repository import BdRepository
from utils.logger_config import Logger
from utils.soap_client import consulta_api_designador

MSGS = {
    "dying": "Existe dying gasp registrado para este BD",
    "ip/ret": "Abertura indevida, produto não tratado na esteira B2B",
    "vvn": "Encaminhar ao time Produtos Digitais",
    "vgr": "Encaminhar ao time Outsourcing SDWAN",
}


class BdService:
    def __init__(self, repository: BdRepository):
        self.repository = repository

    def usuario_assumiu_bd(self, usuario_bd: str, usuario_logado: str) -> bool:
        if usuario_bd == usuario_logado:
            return True

        return False

    def consultar_bd_api_sigitm(self, bd: int) -> tuple:
        info_bd = consulta_bd(bd)

        if info_bd["grupo"] == "ERRO CONSULTA":
            return None, {"error": "Erro na consulta, tente novamente"}, 404

        return info_bd, None, 200

    def buscar_pendecias_star(self, id_comercial: str) -> str:
        pendencia_star = self.repository.consulta_star(id_comercial)

        if pendencia_star.empty:
            return None

        status = pendencia_star["cust_status"].iloc[0].strip().upper()
        # TODO verificar not in depois
        if status not in ["INSTALADO", "INSTALANDO", "RETIRANDO"]:
            return f"Pendência encontrada no star - Status: {status}. Checklist interrompido, validar se o ID do BD é o mesmo do star e sinalizar a supervisão para análise."

    def buscar_pendencias_vantive(self, id_comercial: str) -> str:
        pendencia_vantive = self.repository.consulta_vantive(id_comercial)

        if pendencia_vantive.empty:
            return None

        status = pendencia_vantive["STATUS"].iloc[0].strip().lower()
        if status == "rfs não faturável":
            return f"Pendência encontrada no vantive - status: {status}"

    def buscar_pendencias_bloqueio(self, designador: str) -> str:
        dados_api_bloqueio = consulta_api_designador(designador)
        tipo_bloqueio = dados_api_bloqueio.get("processDesc").strip().upper()

        if tipo_bloqueio != "DESBLOQUEADO":
            return f"Bd com bloqueio: {tipo_bloqueio}"

        return None

    def buscar_pendencias(self, bd: int) -> dict:
        bd_sigitm = self.repository.consulta_ti(bd)
        id_comercial = f"'{bd_sigitm.id_comercial}'"

        pendencias_vantive = self.buscar_pendencias_vantive(id_comercial)
        pendencias_star = self.buscar_pendecias_star(id_comercial)
        pendencias_bloqueio = self.buscar_pendencias_bloqueio(bd_sigitm.designador)
        # pendencias_dying_gasp = self.repository.busca_dying_gasp(bd)

        pendencias = []

        if pendencias_star is not None:
            pendencias.append({"consulta": "star", "mensagem": pendencias_star})

        if pendencias_vantive is not None:
            pendencias.append({"consulta": "vantive", "mensagem": pendencias_vantive})

        if pendencias_bloqueio is not None:
            pendencias.append({"consulta": "bloqueio", "mensagem": pendencias_bloqueio})

        # if not pendencias_dying_gasp.empty:
        #   pendencias.append({"consulta": "dying", "mensagem": MENSAGEM["dying"]})

        return {"pendencias": pendencias}

    def identifica_produto_invalido_B2B(self, bd_api_response: dict) -> dict:
        servico = bd_api_response["servico"].strip().upper()

        produtos_invalidos = []

        if servico in ["IP INTERNET", "RETAIL"]:
            produtos_invalidos.append({"servico": servico, "mensagem": MSGS["ip/ret"]})
        if servico == "VGR":
            produtos_invalidos.append({"servico": servico, "mensagem": MSGS["vgr"]})
        if servico == "VVN":
            produtos_invalidos.append({"servico": servico, "mensagem": MSGS["vvn"]})

        return {"produtos_invalidos": produtos_invalidos}

    def valida_bd(self, bd: int, usuario_logado: str) -> tuple:
        """Realiza todas as validações necessárias para consulta de um BD.

        Esta função executa, em sequência, todas as verificações obrigatórias
        para determinar se o BD pode seguir no fluxo normal de atendimento.

        A função interrompe o fluxo na primeira inconsistência encontrada,
        retornando a estrutura de erro específica. Caso todas as validações
        sejam aprovadas, retorna as informações completas do BD.

        Args:
            bd (int): Número do BD a ser consultado.
            usuario_logado (str): Usuário que está realizando a consulta.

        Returns:
            tuple:
                - dict | None | status_code: Estrutura quando o BD foi validado com sucesso.
                ou
                - None | erro | status_code: Estrutura quando algum erro foi encontrado.
        """
        info_bd, erro, status = self.consultar_bd_api_sigitm(bd)
        if erro:
            return None, erro, status

        # usuario_bd = info_bd["usuario_responsavel"].upper().strip()
        # if not self.usuario_assumiu_bd(usuario_bd, usuario_logado):
        #    return (
        #        None,
        #        {"error": "Bd informado não está no seu nome, bloquear primeiramente."},
        #        403,
        #    )

        produtos_invalidos = self.identifica_produto_invalido_B2B(info_bd)
        if produtos_invalidos["produtos_invalidos"]:
            return None, produtos_invalidos, 422

        resultado_pendencias = self.buscar_pendencias(bd)
        if resultado_pendencias["pendencias"]:
            return None, resultado_pendencias, 422

        return {"info_bd": info_bd}, None, 200

    def carimba_bd(
        self,
        bd: int,
        produto: str,
        matricula_usuario: str,
        grupo_atual: str,
        destino: str,
        carimbo: str,
        registrar_log: bool,
    ) -> tuple:
        """
        Carimba um BD no Sigitm com o carimbo gerado pelo front-end.

        Args:
            bd(int): Número do BD a ser carimbado.
            produto(str): Produto do BD.
            matricula_usuario(str): RE do usuário que vai carimbar o BD no Sigitm
            grupo_atual(str): Grupo atual do BD no Sigitm.
            destino(str): Título do carimbo que foi gerado após o fluxo.
            carimbo(str): Texto do carimbo a ser inserido.
            registrar_log(bool): Booleano para indicar se o log deve ser salvo no banco ou não.

        Returns:
            tuple:
                - dict | None | status_code: Quando o carimbo foi inserido com sucesso;
                ou
                - None | erro | status_code: Quando o carimbo não foi inserido com sucesso.
        """
        mapa_produto = {"DADOS": "10", "DDR": "20", "CONVERGENTE": "30"}
        codigo_prod = mapa_produto.get(produto)

        carimbo_res = nota_bd(bd, codigo_prod, matricula_usuario, grupo_atual, carimbo)
        if carimbo_res == 200:
            if registrar_log:
                log_bd = {"bd": bd, "usuario": matricula_usuario, "destino": destino}
                res_log = self.repository.salvar_log("bcri", "logs_carimbo_pia", log_bd)
                # TODO mudar o nome da tabela para esse

                if not res_log["success"]:
                    log_erro_insercao_banco = f"{bd} | {matricula_usuario} | {res_log}"
                    Logger.escreve_mensagem_log(log_erro_insercao_banco)

            return {"success": True}, None, 200

        _, erro = carimbo_res
        log_message = f"{bd} | {matricula_usuario} | {produto} | {grupo_atual} | {erro}"
        Logger.escreve_mensagem_log(log_message)

        return None, {"error": erro.get("message")}, 406
