import sys

import requests
pantry = {} #dictionary prepared to hold all foods and their barcode
print("Welcome to your VIRTUAL PANTRY! If you want to exit the program, type 'exit' at any time.")

def main():
    print("Menu Options:")
    print("1. Check a product")
    print("2. View pantry")
    print("3. Check 3 Items")
    print("4. Exit")
    while True:
        choice = input("Please select an option (1-4): ")
        if choice.isdigit() and 1 <= int(choice) <= 4:
            break
        else:
            print("Invalid input. Please enter a number between 1 and 4.")
    if choice == "1":
        product_check()  
    elif choice == "2":
        view_pantry()
    elif choice == "3":
        check_three_items()
    elif choice == "4":
        print("Thank you for using the VIRTUAL PANTRY! Goodbye!")
        sys.exit()

def product_check(): #getting barcode and calling API
    while True:
        barcode = input("Barcode: ") #Oreo actual barcode: 066721005694
        if barcode.isdigit():
            break
        else:
            print("Invalid barcode. Please try again.")
    url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}"
    headers = {
        "User-Agent": "MyBarcodeApp/1.0 (barneaw@pedarecc.sa.edu.au)"
        }
    response = requests.get(url, headers=headers)
    data = response.json()
    product_info(data, barcode)

def product_info(data, barcode): #collecting product data from API
    product_name = data.get("product", {}).get("product_name", "Product name not found")
    product_carbohydrates = data.get("product", {}).get("nutriments", {}).get("carbohydrates_100g", "Carbohydrates not found")
    if product_carbohydrates != "Carbohydrates not found":
        product_carbohydrates = round(float(product_carbohydrates), 2)
    product_is_water = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_water", "Is water not found")
    product_is_cheese = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_cheese", "Is cheese not found")
    product_is_beverage = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_beverage", "Is beverage not found")
    product_is_fat = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_fat", "Is fat not found")
    product_health_score = data.get("product", {}).get("nutriscore_grade", "Health score not found").upper()
    product_sugars = data.get("product", {}).get("nutriments", {}).get("sugars_100g", "Sugars not found")
    if product_sugars != "Sugars not found":
        product_sugars = round(float(product_sugars), 2)
    product_print(product_name, product_carbohydrates, product_health_score, product_sugars, product_is_water, product_is_cheese, product_is_beverage, product_is_fat, barcode)

def product_print(product_name, product_carbohydrates, product_health_score, product_sugars, product_is_water, product_is_cheese, product_is_beverage, product_is_fat, barcode): #printing data from API
    print(f"Product Name: {product_name}")
    if product_carbohydrates == "Carbohydrates not found":
        print(f"{product_carbohydrates}")
    else:
        print(f"Carbohydrates: {product_carbohydrates}g")
    print(f"Health Score: {product_health_score}")
    if product_sugars == "Sugars not found":
            print(f"{product_sugars}")
    else:
        print(f"Sugars: {product_sugars}g")

    #If statement using Nutri-Score rating to recomend consumer habits
    if product_health_score == "A":
        print("This product is a very healthy choice.")
    elif product_health_score == "B":
        print("This product is healthy.")
    elif product_health_score == "C":
        print("This product is moderately healthy.")
    elif product_health_score == "D":
        print("This product is unhealthy.")
    elif product_health_score == "E":
        print("Consume in moderation. This product is very unhealthy.")
    else:
        print("Health score not found.")

    #if statement noting the sugar content of the product
    if product_sugars is not None and product_sugars != "Sugars not found":
        if product_sugars < 5:
            print(f"This product is low in sugar ({product_sugars}g per 100g)")
        elif product_sugars >= 5 and product_sugars <= 22.5:
            print(f"This product has moderate sugar levels ({product_sugars}g per 100g)")
        else:
            print(f"This product is high in sugar ({product_sugars}g per 100g)")
    else:
        print("Sugar content not found.")

    #if statement commenting on the carbs in the product
    if product_carbohydrates is not None and product_carbohydrates != "Carbohydrates not found":
        if product_carbohydrates < 100:
            print(f"This product is low in carbohydrates ({product_carbohydrates}g per 100g)")
        elif product_carbohydrates >= 100:
            print(f"This product is high in carbohydrates ({product_carbohydrates}g per 100g)")
    else:
        print("Carbohydrate content not found.")
        
    #Further data from API
    if product_is_water == 0:
        print("Is Product Water?: No")
    elif product_is_water == 1:
        print("Is Product Water?: Yes")
    else:
        print("Is Product Water?: Not found")
    if product_is_cheese == 0:
        print("Is Product Cheese?: No")
    elif product_is_cheese == 1:
        print("Is Product Cheese?: Yes")
    else:
        print("Is Product Cheese?: Not found")
    if product_is_beverage == 0:
        print("Is Product Beverage?: No")
    elif product_is_beverage == 1:
        print("Is Product Beverage?: Yes")
    else:
        print("Is Product Beverage?: Not found")
    if product_is_fat == 0:
        print("Is Product Fat?: No")
    elif product_is_fat == 1:
        print("Is Product Fat?: Yes")
    else:
        print("Is Product Fat?: Not found")

    product_pantry(product_name, product_carbohydrates, product_health_score, product_sugars, product_is_water, product_is_cheese, product_is_beverage, product_is_fat, barcode)

def product_pantry(product_name, product_carbohydrates, product_health_score, product_sugars, product_is_water, product_is_cheese, product_is_beverage, product_is_fat, barcode): #adding products to pantry
    while True:
        add_y_n = input("Do you want to add this product to your pantry? (yes/no): ").lower()
        if add_y_n == "yes":
            pantry[product_name] = {
                "barcode": barcode,
                "nutri-score": product_health_score,
                "carbohydrates": product_carbohydrates,
                "sugars": product_sugars,
                "is_water": product_is_water,
                "is_cheese": product_is_cheese,
                "is_beverage": product_is_beverage,
                "is_fat": product_is_fat
            }
            print("Product added to pantry!")
            print("Current Pantry:")
            for product in pantry:
                print(f"{product}, Barcode: {pantry[product]['barcode']}, Nutri-Score: {pantry[product]['nutri-score']}, Carbohydrates: {pantry[product]['carbohydrates']} g, Sugars: {pantry[product]['sugars']} g")
            break
        elif add_y_n == "no":
            print("Product not added to pantry.")
            break
        else:
            print("Invalid input. Please enter 'yes' or 'no'.")
    main()

def view_pantry(): #viewing pantry 
    if not pantry:
        print("Your pantry is empty.")
    else:
        print("Current Pantry:")
        for product in pantry:
            print(f"{product}, Barcode: {pantry[product]['barcode']}, Nutri-Score: {pantry[product]['nutri-score']}, Carbohydrates: {pantry[product]['carbohydrates']} g, Sugars: {pantry[product]['sugars']} g")
    main()

def check_three_items(): #checking 3 items in pantry
    in_pantry = len(pantry)
    if in_pantry < 3:
        print(f"You have {in_pantry} item(s) in your pantry. Please add more items to compare 3 items.")
    elif in_pantry == 3:
        print("You have 3 items in your pantry. They are:")
        for item in pantry:
            print(f"{item}")
        print("The barcode, sugars, carbohydrates, nutri-score and water status of these products is as follows")
        print("Barcodes:")
        for item in pantry:
            print(f"{item}: {pantry[item]['barcode']}")
        print("Sugars:")
        for item in pantry:
            print(f"{item}: {pantry[item]['sugars']}g")
        print("Carbohydrates:")
        for item in pantry:
            print(f"{item}: {pantry[item]['carbohydrates']}g")
        print("Nutri-Scores:")
        for item in pantry:
            print(f"{item}: {pantry[item]['nutri-score']}")
        print("Water Status:")
        for item in pantry:
            water_status = "Yes" if pantry[item]['is_water'] == 1 else "No"
            print(f"{item}: {water_status}")
    else:
        print(f"You have {in_pantry} items in your pantry. They are:")
        for item in pantry:
            print(f"{item}")
        
        products = list(pantry.keys())
        print("\nChoose 3 products to compare:")
        for i, item in enumerate(products, start=1):
            print(f"{i}. {item}")
        
        selected = []

        while len(selected) < 3:
            choice = input(
                f"Select product {len(selected) + 1} "
                f"(enter a number from 1 to {len(products)}): "
        )
            if not choice.isdigit():
                print("Invalid input. Please enter a number.")
                continue

                choice = int(choice)

            if choice < 1 or choice > len(products):
                print("That number is not in the list.")
                continue

            product = products[choice - 1]

            if product in selected:
                print("You have already selected that product.")
                continue

            selected.append(product)

            print("\nComparison of your selected products:")

            for item in selected:
                details = pantry[item]
                print(f"\nProduct: {item}")
                print(f"Barcode: {details['barcode']}")
                print(f"Sugars: {details['sugars']} g")
                print(f"Carbohydrates: {details['carbohydrates']} g")
                print(f"Nutri-Score: {details['nutri-score']}")
                if is_water == 1
                    print("Is Water: Yes")
                elif is_water == 0
                    print("Is Water: No")
                else:
                    print("Is Water: Not found"
            main()


if __name__ == "__main__":
    main()
