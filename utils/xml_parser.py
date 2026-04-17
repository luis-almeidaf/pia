import xml.etree.ElementTree as ET


def xml_to_dict(xml_string):
    root = ET.fromstring(xml_string)

    def parse_element(element):
        parsed_data = {}
        for child in element:
            # Removendo o namespace da tag
            tag = child.tag.split("}")[1] if "}" in child.tag else child.tag
            # Verificando se o filho tem mais de um item e tratando como lista
            if len(child) > 0:
                if tag not in parsed_data:
                    parsed_data[tag] = [parse_element(child)]
                else:
                    parsed_data[tag].append(parse_element(child))
            else:
                parsed_data[tag] = child.text
        return parsed_data

    return parse_element(root)
