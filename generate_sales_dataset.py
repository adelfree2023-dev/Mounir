import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Define the number of rows
num_rows = 5000

# Define data categories
regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa']
countries = {
    'North America': ['USA', 'Canada', 'Mexico'],
    'Europe': ['Germany', 'UK', 'France', 'Italy', 'Spain', 'Netherlands'],
    'Asia Pacific': ['China', 'Japan', 'India', 'Australia', 'Singapore', 'South Korea'],
    'Latin America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
    'Middle East & Africa': ['UAE', 'Saudi Arabia', 'South Africa', 'Egypt', 'Nigeria']
}

product_categories = ['Electronics', 'Furniture', 'Office Supplies', 'Clothing', 'Food & Beverages']
products = {
    'Electronics': ['Laptop', 'Desktop Computer', 'Tablet', 'Smartphone', 'Monitor', 'Printer', 'Camera', 'Headphones'],
    'Furniture': ['Office Chair', 'Desk', 'Filing Cabinet', 'Conference Table', 'Bookshelf', 'Sofa', 'Lamp'],
    'Office Supplies': ['Paper', 'Pens', 'Notebooks', 'Folders', 'Staplers', 'Ink Cartridges', 'Binders'],
    'Clothing': ['Business Suit', 'Shirt', 'Pants', 'Dress', 'Shoes', 'Jacket', 'Tie'],
    'Food & Beverages': ['Coffee', 'Tea', 'Snacks', 'Water', 'Soft Drinks', 'Energy Bars']
}

customer_segments = ['Enterprise', 'SMB', 'Individual', 'Government', 'Education']
sales_channels = ['Direct Sales', 'Online', 'Retail', 'Partner', 'Distributor']
payment_methods = ['Credit Card', 'Bank Transfer', 'PayPal', 'Check', 'Cash']
order_status = ['Completed', 'Pending', 'Shipped', 'Cancelled', 'Returned']

# Generate sales representatives
sales_reps = [f'Rep_{i:03d}' for i in range(1, 51)]
sales_rep_names = [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
    'Jessica Martinez', 'Robert Taylor', 'Lisa Anderson', 'James Thomas', 'Maria Garcia',
    'William Rodriguez', 'Jennifer Lee', 'Richard White', 'Laura Harris', 'Charles Clark',
    'Patricia Lewis', 'Daniel Walker', 'Nancy Hall', 'Matthew Allen', 'Karen Young',
    'Christopher King', 'Betty Wright', 'Andrew Lopez', 'Sandra Hill', 'Mark Scott',
    'Ashley Green', 'Steven Adams', 'Donna Baker', 'Paul Nelson', 'Michelle Carter',
    'George Mitchell', 'Carol Perez', 'Kenneth Roberts', 'Amanda Turner', 'Brian Phillips',
    'Melissa Campbell', 'Edward Parker', 'Deborah Evans', 'Ronald Edwards', 'Stephanie Collins',
    'Timothy Stewart', 'Rebecca Sanchez', 'Jason Morris', 'Sharon Rogers', 'Jeffrey Reed',
    'Cynthia Cook', 'Ryan Morgan', 'Kathleen Bell', 'Jacob Murphy', 'Amy Bailey'
]

# Generate data
data = []

start_date = datetime(2023, 1, 1)
end_date = datetime(2025, 12, 31)

for i in range(num_rows):
    # Generate order ID
    order_id = f'ORD-{2023 + (i // 2000)}-{i+1:05d}'
    
    # Generate random date
    days_diff = (end_date - start_date).days
    random_days = random.randint(0, days_diff)
    order_date = start_date + timedelta(days=random_days)
    
    # Select region and country
    region = random.choice(regions)
    country = random.choice(countries[region])
    
    # Select product category and product
    category = random.choice(product_categories)
    product = random.choice(products[category])
    
    # Generate customer information
    customer_id = f'CUST-{random.randint(1000, 9999)}'
    customer_segment = random.choice(customer_segments)
    
    # Generate sales information
    sales_rep_id = random.choice(sales_reps)
    sales_rep_name = sales_rep_names[int(sales_rep_id.split('_')[1]) - 1]
    
    # Generate financial data
    quantity = random.randint(1, 100)
    unit_price = round(random.uniform(10, 5000), 2)
    gross_sales = round(quantity * unit_price, 2)
    discount_pct = random.choice([0, 5, 10, 15, 20, 25])
    discount_amount = round(gross_sales * discount_pct / 100, 2)
    net_sales = round(gross_sales - discount_amount, 2)
    cost_of_goods = round(net_sales * random.uniform(0.4, 0.7), 2)
    profit = round(net_sales - cost_of_goods, 2)
    profit_margin = round((profit / net_sales * 100) if net_sales > 0 else 0, 2)
    
    # Generate other details
    sales_channel = random.choice(sales_channels)
    payment_method = random.choice(payment_methods)
    status = random.choice(order_status)
    
    # Shipping information
    ship_date = order_date + timedelta(days=random.randint(1, 7)) if status in ['Completed', 'Shipped'] else None
    delivery_date = ship_date + timedelta(days=random.randint(3, 14)) if ship_date else None
    
    # Create row
    row = {
        'Order_ID': order_id,
        'Order_Date': order_date.strftime('%Y-%m-%d'),
        'Ship_Date': ship_date.strftime('%Y-%m-%d') if ship_date else '',
        'Delivery_Date': delivery_date.strftime('%Y-%m-%d') if delivery_date else '',
        'Order_Status': status,
        'Customer_ID': customer_id,
        'Customer_Segment': customer_segment,
        'Region': region,
        'Country': country,
        'Product_Category': category,
        'Product_Name': product,
        'Quantity': quantity,
        'Unit_Price': unit_price,
        'Gross_Sales': gross_sales,
        'Discount_Percent': discount_pct,
        'Discount_Amount': discount_amount,
        'Net_Sales': net_sales,
        'Cost_of_Goods': cost_of_goods,
        'Profit': profit,
        'Profit_Margin_Percent': profit_margin,
        'Sales_Channel': sales_channel,
        'Payment_Method': payment_method,
        'Sales_Rep_ID': sales_rep_id,
        'Sales_Rep_Name': sales_rep_name
    }
    
    data.append(row)

# Create DataFrame
df = pd.DataFrame(data)

# Sort by Order_Date
df = df.sort_values('Order_Date').reset_index(drop=True)

# Save to Excel - simplified version for efficiency
output_file = 'Global_Sales_Master_Dataset.xlsx'

print("Creating Excel file...")
df.to_excel(output_file, sheet_name='Sales_Data', index=False, engine='openpyxl')

print("Adding summary sheet...")
# Create a separate workbook with openpyxl to add summary
from openpyxl import load_workbook

wb = load_workbook(output_file)

# Add a summary sheet
summary_data = {
    'Metric': [
        'Total Records',
        'Total Customers',
        'Total Orders',
        'Date Range',
        'Total Gross Sales',
        'Total Net Sales',
        'Total Profit',
        'Average Profit Margin %',
        'Number of Regions',
        'Number of Countries',
        'Number of Products',
        'Number of Sales Reps'
    ],
    'Value': [
        len(df),
        df['Customer_ID'].nunique(),
        df['Order_ID'].nunique(),
        f"{df['Order_Date'].min()} to {df['Order_Date'].max()}",
        f"${df['Gross_Sales'].sum():,.2f}",
        f"${df['Net_Sales'].sum():,.2f}",
        f"${df['Profit'].sum():,.2f}",
        f"{df['Profit_Margin_Percent'].mean():.2f}%",
        df['Region'].nunique(),
        df['Country'].nunique(),
        df['Product_Name'].nunique(),
        df['Sales_Rep_ID'].nunique()
    ]
}

summary_df = pd.DataFrame(summary_data)

# Write summary to a new sheet
with pd.ExcelWriter(output_file, engine='openpyxl', mode='a') as writer:
    summary_df.to_excel(writer, sheet_name='Summary', index=False)

print("Finalizing...")

print(f"✅ Dataset generated successfully!")
print(f"📊 File: {output_file}")
print(f"📈 Total rows: {len(df):,}")
print(f"💰 Total Net Sales: ${df['Net_Sales'].sum():,.2f}")
print(f"💵 Total Profit: ${df['Profit'].sum():,.2f}")
print(f"\n📋 Dataset includes:")
print(f"   - {df['Customer_ID'].nunique():,} unique customers")
print(f"   - {df['Region'].nunique()} regions")
print(f"   - {df['Country'].nunique()} countries")
print(f"   - {df['Product_Category'].nunique()} product categories")
print(f"   - {df['Product_Name'].nunique()} unique products")
print(f"   - {df['Sales_Rep_ID'].nunique()} sales representatives")
