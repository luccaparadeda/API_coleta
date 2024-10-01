import requests
import json

BASE_URL = 'http://api:3000/api'

def get_data(limit=10):
    response = requests.get(f'{BASE_URL}/data', params={'limit': limit})
    return response.json()

def get_data_by_field(field, value):
    response = requests.get(f'{BASE_URL}/data/{field}/{value}')
    return response.json()

def filter_data(filters):
    response = requests.post(f'{BASE_URL}/data/filter', json=filters)
    return response.json()

def add_data(new_data):
    response = requests.post(f'{BASE_URL}/data', json=new_data)
    return response.json()

def update_data(id, updated_data):
    response = requests.put(f'{BASE_URL}/data/{id}', json=updated_data)
    return response.json()

def delete_data(id):
    response = requests.delete(f'{BASE_URL}/data/{id}')
    return response.json()

def print_data(data):
    print(json.dumps(data, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    print("Fetching first 5 entries:")
    print_data(get_data(5))

    print("\nFetching data for estado 'AMAZONAS':")
    print_data(get_data_by_field('estado', 'AMAZONAS'))

    print("\nFiltering data for estado 'RORAIMA' and bioma 'Amazônia':")
    print_data(filter_data({'estado': 'RORAIMA', 'bioma': 'Amazônia'}))

    print("\nAdding new data:")
    new_entry = {
        "data": "2024-01-02",
        "municipio": "NOVO MUNICÍPIO",
        "estado": "ESTADO TESTE",
        "bioma": "Teste",
        "avg_numero_dias_sem_chuva": "1.0",
        "avg_precipitacao": "100.0",
        "avg_risco_fogo": "50.0",
        "avg_frp": "75.0"
    }
    added_data = add_data(new_entry)
    print_data(added_data)

    print("\nUpdating the newly added data:")
    updated_data = update_data(added_data['id'], {"avg_risco_fogo": "60.0"})
    print_data(updated_data)

    print("\nDeleting the updated data:")
    deleted_data = delete_data(updated_data['id'])
    print_data(deleted_data)