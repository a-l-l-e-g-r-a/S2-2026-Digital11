import requests

go = "true"
pantry = []
print("Welcome to your VIRTUAL PANTRY! If you want to exit the program, type 'exit' at any time.")

while go == "true":
    product_check = input("Do you want to check another product? (yes/no): ").lower()
    if product_check == "yes":
        barcode = input("Barcode: ")
        url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}"
        response = requests.get(url)
        data = response.json()

        product_name = data.get("product", {}).get("product_name", "Product name not found")
        product_carbohydrates = data.get("product", {}).get("nutriments", {}).get("carbohydrates_100g", "Carbohydrates not found")
        product_is_water = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_water", "Is water not found")
        product_is_cheese = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_cheese", "Is cheese not found")
        product_is_beverage = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_beverage", "Is beverage not found")
        product_is_fat = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_fat", "Is fat not found")

        print(f"Product Name: {product_name}")
        print(f"Carbohydrates: {product_carbohydrates} g")
        if product_is_water == 0:
            print("Is Product Water?: No")
        else:
            print("Is Product Water?: Yes")
        if product_is_cheese == 0:
            print("Is Product Cheese?: No")
        else:
            print("Is Product Cheese?: Yes")
        if product_is_beverage == 0:
            print("Is Product Beverage?: No")
        else:
            print("Is Product Beverage?: Yes")
        if product_is_fat == 0:
            print("Is Product Fat?: No")
        else:
            print("Is Product Fat?: Yes")
        add_y_n = input("Do you want to add this product to your pantry? (yes/no): ").lower()
        if add_y_n == "yes":
            pantry.append(barcode)
            print("Product added to pantry!")
            print(f"Current pantry: {pantry}")

    elif product_check == "no":
        print("Thank you for using the VIRTUAL PANTRY! Goodbye!")
        go = "false"
    elif product_check == "exit":
        print("Thank you for using the VIRTUAL PANTRY! Goodbye!")
        go = "false"

