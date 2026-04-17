import pandas as pd
from cross_lib.conexao.banco import executar_query, inserir_log
from cross_lib.conexao.banco.get_query_sql import get_query
from models.bd_sigitmti import BdSigitmti


class BdRepository:
    def busca_dying_gasp(self, bd: int) -> pd.DataFrame:
        query_dying_gasp = get_query("query_dying_gasp.sql", {"bd": bd})
        resultado_dying_gasp = executar_query("bcri", query_dying_gasp)
        return resultado_dying_gasp

    def consulta_ti(self, bd: int) -> BdSigitmti:
        query_ti = get_query("query_ti.sql", {"bd": bd})
        df = executar_query("sigitmti", query_ti)

        if df.empty:
            return BdSigitmti(bd, None, None)

        id_comercial = df["tis_id_comercial"].iloc[0]
        designador = df["tis_cliente_terminal"].iloc[0]

        return BdSigitmti(bd, id_comercial, designador)

    def consulta_star(self, id_comercial: str) -> pd.DataFrame:
        if id_comercial is None:
            return pd.DataFrame()
        query_star = get_query("query_star.sql", {"id_comercial": id_comercial})
        return executar_query("star", query_star)

    def consulta_vantive(self, id_comercial: str) -> pd.DataFrame:
        if id_comercial is None:
            return pd.DataFrame()
        query_vantive = get_query("query_vantive.sql", {"id_comercial": id_comercial})
        return executar_query("codafofo", query_vantive)

    def salvar_log(self, banco: str, tabela: str, dados_log: dict) -> dict:
        return inserir_log(banco, tabela, dados_log)
