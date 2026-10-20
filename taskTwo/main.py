import sys

import requests
pantry = {} #dictionary prepared to hold all foods and their barcode
print("Welcome to your VIRTUAL PANTRY! If you want to exit the program, type 'exit' at any time.")

def main():
    product_check = input("Do you want to check another product? (yes/no): ").lower()
    if product_check == "yes":
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

        #collecting data from Open Food Facts API
        product_name = data.get("product", {}).get("product_name", "Product name not found")
        product_carbohydrates = data.get("product", {}).get("nutriments", {}).get("carbohydrates_100g", "Carbohydrates not found")
        product_is_water = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_water", "Is water not found")
        product_is_cheese = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_cheese", "Is cheese not found")
        product_is_beverage = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_beverage", "Is beverage not found")
        product_is_fat = data.get("product", {}).get("nutriscore", {}).get("2021", {}).get("data", {}).get("is_fat", "Is fat not found")
        product_health_score = data.get("product", {}).get("nutriscore_grade", "Health score not found").upper()
        product_sugars = data.get("product", {}).get("nutriments", {}).get("sugars_100g", "Sugars not found")

        #Printing data from API
        print(f"Product Name: {product_name}")
        print(f"Carbohydrates: {product_carbohydrates} g")
        print(f"Health Score: {product_health_score}")
        print(f"Sugars: {product_sugars} g")

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
        if product_sugars is not None:
            if product_sugars <= 5:
                print(f"This product is low in sugar ({product_sugars} g per 100g)")
            elif product_sugars <= 22.5:
                print(f"This product has moderate sugar levels ({product_sugars} g per 100g)")
            else:
                print(f"This product is high in sugar ({product_sugars} g per 100g)")
        else:
            print("Sugar content not found.")
        
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
        
        while True:
            add_y_n = input("Do you want to add this product to your pantry? (yes/no): ").lower()
            if add_y_n == "yes":
                pantry[product_name] = barcode
                print("Product added to pantry!")
                print("Current Pantry:")
                for product in pantry:
                    print(f"{product}")
                break
            elif add_y_n == "no":
                print("Product not added to pantry.")
                break
            else:
                print("Invalid input. Please enter 'yes' or 'no'.")
        main()
                
    elif product_check == "no":
        print("Thank you for using the VIRTUAL PANTRY! Goodbye!")
        sys.exit()
    elif product_check == "exit":
        print("Thank you for using the VIRTUAL PANTRY! Goodbye!")
        sys.exit()
    else:
        print("Invalid input. Please enter 'yes' or 'no'.")
        main()

if __name__ == "__main__":
    main()
