import requests
from utils.xml_parser import xml_to_dict


def consulta_api_designador(designador):
    # URL do serviço SOAP
    url = "http://mbuservices.gvt.net.br:80/ConsultServicesWSImpl/ConsultServicesWSImplService"

    # Cabeçalhos da requisição
    headers = {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "",
    }

    # Corpo da requisição SOAP com o designador como variável
    body = f"""<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:scm="http://scm.oss.gvt.com.br/">
       <soapenv:Header/>
       <soapenv:Body>
          <scm:consultBlockedIn>
             <contract>?</contract>
             <designator>{designador}</designator>
             <params>
                <name>?</name>
                <value>?</value>
             </params>
          </scm:consultBlockedIn>
       </soapenv:Body>
    </soapenv:Envelope>"""

    # Enviando a requisição SOAP
    response = requests.post(url, data=body, headers=headers)

    # Verificando o status da resposta
    if response.status_code == 200:
        try:
            response_dict = xml_to_dict(response.text)

            # Caminho correto para os dados desejados no dicionário
            process_desc = response_dict["Body"][0]["consultBlockedOut"][0]["item"][0][
                "processDesc"
            ]
            service_type = response_dict["Body"][0]["consultBlockedOut"][0]["item"][0][
                "serviceType"
            ]

            # Retornando os valores extraídos
            return {"processDesc": process_desc, "serviceType": service_type}
        except Exception as e:
            print(f"Erro ao converter XML para JSON: {e}")
            return {}
    else:
        print(f"Erro na requisição SOAP: {response.status_code}")
        print(response.text)
        return {}
