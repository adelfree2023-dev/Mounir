"""
Enterprise Subscription-Based Retail & E-Commerce Platform - Data Generator
Generates realistic data for BI analytics covering all 27 EU countries
Currency: USD
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from faker import Faker
import os

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Initialize Faker
fake = Faker()

# Configuration
NUM_CUSTOMERS = 10000
NUM_PRODUCTS = 500
NUM_SALES = 100000
NUM_SUBSCRIPTIONS = 15000
NUM_SUPPORT_TICKETS = 8000
START_DATE = datetime(2023, 1, 1)
END_DATE = datetime(2026, 12, 31)

# EU Countries with realistic distribution weights (based on population/economy)
EU_COUNTRIES = {
    'Germany': 0.18, 'France': 0.15, 'Italy': 0.13, 'Spain': 0.10,
    'Poland': 0.08, 'Netherlands': 0.04, 'Belgium': 0.03, 'Greece': 0.03,
    'Portugal': 0.03, 'Czech Republic': 0.03, 'Sweden': 0.03, 'Hungary': 0.02,
    'Austria': 0.02, 'Romania': 0.02, 'Denmark': 0.02, 'Finland': 0.02,
    'Slovakia': 0.015, 'Ireland': 0.015, 'Croatia': 0.01, 'Lithuania': 0.008,
    'Slovenia': 0.005, 'Latvia': 0.005, 'Estonia': 0.004, 'Cyprus': 0.003,
    'Luxembourg': 0.002, 'Malta': 0.001, 'Bulgaria': 0.015
}

# Product Categories with pricing ranges
PRODUCT_CATEGORIES = {
    'Electronics': {'min': 50, 'max': 1500, 'margin': 0.25},
    'Fashion': {'min': 20, 'max': 300, 'margin': 0.50},
    'Home & Garden': {'min': 30, 'max': 500, 'margin': 0.40},
    'Sports': {'min': 25, 'max': 400, 'margin': 0.35},
    'Beauty': {'min': 15, 'max': 150, 'margin': 0.60},
    'Books': {'min': 10, 'max': 50, 'margin': 0.40},
    'Toys': {'min': 15, 'max': 200, 'margin': 0.45}
}

BRANDS = ['TechPro', 'StyleCo', 'HomeEssentials', 'FitLife', 'BeautyMax', 
          'BookWorld', 'PlayTime', 'PremiumChoice', 'ValueBrand', 'EcoLife']

AGE_GROUPS = ['18-25', '26-35', '36-45', '46-55', '56-65', '66+']

ACQUISITION_CHANNELS = ['Organic Search', 'Paid Ads', 'Social Media', 'Referral', 'Email']

MARKETING_CHANNELS = [
    {'id': 'WEB-01', 'type': 'Online', 'campaign': 'Summer Sale 2023'},
    {'id': 'WEB-02', 'type': 'Online', 'campaign': 'Black Friday 2023'},
    {'id': 'WEB-03', 'type': 'Online', 'campaign': 'New Year 2024'},
    {'id': 'APP-01', 'type': 'Mobile', 'campaign': 'App Launch Promo'},
    {'id': 'APP-02', 'type': 'Mobile', 'campaign': 'Mobile Exclusive'},
    {'id': 'EMAIL-01', 'type': 'Online', 'campaign': 'Retention Campaign'},
    {'id': 'EMAIL-02', 'type': 'Online', 'campaign': 'Win-Back Campaign'},
    {'id': 'WEB-04', 'type': 'Online', 'campaign': 'Spring Collection'},
]

SUBSCRIPTION_PLANS = [
    {'id': 'BASIC', 'fee': 9.99},
    {'id': 'STANDARD', 'fee': 19.99},
    {'id': 'PREMIUM', 'fee': 39.99}
]

CHURN_REASONS = [
    {'id': 'PRICE-01', 'category': 'Price', 'reason': 'Too Expensive'},
    {'id': 'PRICE-02', 'category': 'Price', 'reason': 'Better Deal Elsewhere'},
    {'id': 'SERVICE-01', 'category': 'Service Quality', 'reason': 'Poor Customer Service'},
    {'id': 'SERVICE-02', 'category': 'Service Quality', 'reason': 'Slow Delivery'},
    {'id': 'COMP-01', 'category': 'Competitor', 'reason': 'Switched to Competitor'},
    {'id': 'PROD-01', 'category': 'Product Availability', 'reason': 'Product Not Available'},
    {'id': 'TECH-01', 'category': 'Technical Issues', 'reason': 'Technical Problems'},
]

ISSUE_TYPES = ['Product Defect', 'Delivery Issue', 'Billing', 'Technical Support', 'Returns']

# EU Holidays (simplified - major ones)
EU_HOLIDAYS = [
    ('2023-01-01', 'New Year'), ('2023-12-25', 'Christmas'),
    ('2023-11-24', 'Black Friday'), ('2023-12-26', 'Boxing Day'),
    ('2024-01-01', 'New Year'), ('2024-12-25', 'Christmas'),
    ('2024-11-29', 'Black Friday'), ('2024-12-26', 'Boxing Day'),
    ('2025-01-01', 'New Year'), ('2025-12-25', 'Christmas'),
    ('2025-11-28', 'Black Friday'), ('2025-12-26', 'Boxing Day'),
    ('2026-01-01', 'New Year'), ('2026-12-25', 'Christmas'),
    ('2026-11-27', 'Black Friday'), ('2026-12-26', 'Boxing Day'),
]

print("🚀 Starting Enterprise Data Generation...")
print("=" * 60)

# Create output directory
os.makedirs('data', exist_ok=True)

# ============================================================================
# 1. Generate Dim_Date
# ============================================================================
print("\n📅 Generating Dim_Date...")
dates = pd.date_range(start=START_DATE, end=END_DATE, freq='D')
dim_date = pd.DataFrame({
    'Date_ID': dates,
    'Day': dates.day,
    'Month': dates.month,
    'Quarter': dates.quarter,
    'Year': dates.year,
    'Is_Holiday': 'No'
})

# Mark holidays
for holiday_date, holiday_name in EU_HOLIDAYS:
    dim_date.loc[dim_date['Date_ID'] == holiday_date, 'Is_Holiday'] = holiday_name

dim_date.to_csv('data/dim_date.csv', index=False)
print(f"✓ Generated {len(dim_date):,} date records")

# ============================================================================
# 2. Generate Dim_Customer
# ============================================================================
print("\n👤 Generating Dim_Customer...")
customers = []

for i in range(1, NUM_CUSTOMERS + 1):
    # Select country based on distribution
    country = random.choices(list(EU_COUNTRIES.keys()), 
                            weights=list(EU_COUNTRIES.values()))[0]
    
    customers.append({
        'Customer_ID': i,
        'Gender': random.choice(['Male', 'Female', 'Other']),
        'Age_Group': random.choice(AGE_GROUPS),
        'City': fake.city(),
        'Country': country,
        'Customer_Segment': random.choices(['VIP', 'Regular'], weights=[0.2, 0.8])[0],
        'Acquisition_Channel': random.choice(ACQUISITION_CHANNELS)
    })

dim_customer = pd.DataFrame(customers)
dim_customer.to_csv('data/dim_customer.csv', index=False)
print(f"✓ Generated {len(dim_customer):,} customer records across {len(EU_COUNTRIES)} EU countries")

# ============================================================================
# 3. Generate Dim_Product
# ============================================================================
print("\n📦 Generating Dim_Product...")
products = []

for i in range(1, NUM_PRODUCTS + 1):
    category = random.choice(list(PRODUCT_CATEGORIES.keys()))
    price_range = PRODUCT_CATEGORIES[category]
    price = round(random.uniform(price_range['min'], price_range['max']), 2)
    
    # Determine price tier
    if price < 50:
        price_tier = 'Economy'
    elif price < 200:
        price_tier = 'Mid-Range'
    else:
        price_tier = 'Premium'
    
    products.append({
        'Product_ID': i,
        'Category': category,
        'Brand': random.choice(BRANDS),
        'Price_Tier': price_tier,
        'Unit_Price': price,  # Added for sales calculation
        'Cost_Price': round(price * (1 - price_range['margin']), 2)  # Added for profit calculation
    })

dim_product = pd.DataFrame(products)
dim_product.to_csv('data/dim_product.csv', index=False)
print(f"✓ Generated {len(dim_product):,} product records across {len(PRODUCT_CATEGORIES)} categories")

# ============================================================================
# 4. Generate Dim_Channel
# ============================================================================
print("\n📣 Generating Dim_Channel...")
dim_channel = pd.DataFrame(MARKETING_CHANNELS)
dim_channel.columns = ['Channel_ID', 'Channel_Type', 'Campaign_Name']
dim_channel.to_csv('data/dim_channel.csv', index=False)
print(f"✓ Generated {len(dim_channel)} marketing channel records")

# ============================================================================
# 5. Generate Dim_Churn_Reason
# ============================================================================
print("\n📉 Generating Dim_Churn_Reason...")
dim_churn = pd.DataFrame(CHURN_REASONS)
dim_churn = dim_churn[['id', 'category', 'reason']]
dim_churn.columns = ['Churn_Reason_ID', 'Category', 'Reason']
dim_churn.to_csv('data/dim_churn_reason.csv', index=False)
print(f"✓ Generated {len(dim_churn)} churn reason records")

# ============================================================================
# 6. Generate Fact_Subscription
# ============================================================================
print("\n💳 Generating Fact_Subscription...")
subscriptions = []

for i in range(1, NUM_SUBSCRIPTIONS + 1):
    customer_id = random.randint(1, NUM_CUSTOMERS)
    plan = random.choice(SUBSCRIPTION_PLANS)
    
    # Random start date
    start_date = fake.date_between(start_date=START_DATE, end_date=datetime(2026, 6, 30))
    start_datetime = datetime.combine(start_date, datetime.min.time())
    
    # Determine status (70% active, 30% churned)
    is_active = random.random() < 0.7
    
    if is_active:
        end_date = None
        churn_reason = None
        # Calculate months active
        months_active = (datetime.now() - start_datetime).days / 30
    else:
        # Churned - add random churn date
        churn_date = start_datetime + timedelta(days=random.randint(30, 730))  # 1-24 months
        end_date = churn_date
        churn_reason = random.choice(CHURN_REASONS)['id']
        months_active = (end_date - start_datetime).days / 30
    
    # Calculate lifetime value
    lifetime_value = round(plan['fee'] * months_active, 2)
    
    subscriptions.append({
        'Subscription_ID': i,
        'Customer_ID': customer_id,
        'Start_Date': start_date,
        'End_Date': end_date if not is_active else None,
        'Plan_ID': plan['id'],
        'Monthly_Fee': plan['fee'],
        'Status': 'Active' if is_active else 'Churned',
        'Churn_Reason_ID': churn_reason,
        'Lifetime_Value': lifetime_value
    })

fact_subscription = pd.DataFrame(subscriptions)
fact_subscription.to_csv('data/fact_subscription.csv', index=False)
print(f"✓ Generated {len(fact_subscription):,} subscription records")
print(f"  - Active: {len(fact_subscription[fact_subscription['Status'] == 'Active']):,}")
print(f"  - Churned: {len(fact_subscription[fact_subscription['Status'] == 'Churned']):,}")

# ============================================================================
# 7. Generate Fact_Sales
# ============================================================================
print("\n💰 Generating Fact_Sales...")
sales = []

# Get subscription customer IDs for linking
subscription_customers = fact_subscription['Customer_ID'].unique()

for i in range(1, NUM_SALES + 1):
    customer_id = random.randint(1, NUM_CUSTOMERS)
    product = dim_product.sample(n=1).iloc[0]
    
    # Random sale date with seasonal pattern (more sales in Q4)
    month = random.choices(range(1, 13), 
                          weights=[8, 7, 8, 9, 8, 9, 8, 9, 10, 11, 15, 18])[0]
    year = random.randint(2023, 2026)
    day = random.randint(1, 28)
    sale_date = datetime(year, month, day)
    
    # Quantity (1-5 items)
    quantity = random.choices([1, 2, 3, 4, 5], weights=[50, 30, 12, 5, 3])[0]
    
    # Calculate revenue
    unit_price = product['Unit_Price']
    gross_revenue = round(unit_price * quantity, 2)
    
    # Discount (higher during holidays and Black Friday)
    is_holiday = dim_date[dim_date['Date_ID'] == sale_date.strftime('%Y-%m-%d')]['Is_Holiday'].values
    if len(is_holiday) > 0 and is_holiday[0] != 'No':
        discount_pct = random.uniform(0.15, 0.40)  # 15-40% off
    else:
        discount_pct = random.choices([0, 0.05, 0.10, 0.15], weights=[60, 25, 10, 5])[0]
    
    discount_amount = round(gross_revenue * discount_pct, 2)
    net_revenue = round(gross_revenue - discount_amount, 2)
    
    # Calculate cost and profit
    cost = round(product['Cost_Price'] * quantity, 2)
    profit = round(net_revenue - cost, 2)
    
    # Link to subscription if customer has one
    subscription_id = None
    if customer_id in subscription_customers:
        customer_subs = fact_subscription[fact_subscription['Customer_ID'] == customer_id]
        if len(customer_subs) > 0:
            subscription_id = customer_subs.iloc[0]['Subscription_ID']
    
    sales.append({
        'Sales_ID': i,
        'Date_ID': sale_date.strftime('%Y-%m-%d'),
        'Customer_ID': customer_id,
        'Product_ID': int(product['Product_ID']),
        'Channel_ID': random.choice(dim_channel['Channel_ID'].tolist()),
        'Subscription_ID': subscription_id,
        'Quantity': quantity,
        'Gross_Revenue': gross_revenue,
        'Discount_Amount': discount_amount,
        'Net_Revenue': net_revenue,
        'Cost': cost,
        'Profit': profit
    })

fact_sales = pd.DataFrame(sales)
fact_sales.to_csv('data/fact_sales.csv', index=False)
print(f"✓ Generated {len(fact_sales):,} sales transaction records")
print(f"  - Total Revenue: ${fact_sales['Net_Revenue'].sum():,.2f}")
print(f"  - Total Profit: ${fact_sales['Profit'].sum():,.2f}")

# ============================================================================
# 8. Generate Fact_Customer_Support
# ============================================================================
print("\n🎫 Generating Fact_Customer_Support...")
support_tickets = []

for i in range(1, NUM_SUPPORT_TICKETS + 1):
    customer_id = random.randint(1, NUM_CUSTOMERS)
    customer_segment = dim_customer[dim_customer['Customer_ID'] == customer_id]['Customer_Segment'].values[0]
    
    # Random ticket date
    ticket_date = fake.date_between(start_date=START_DATE, end_date=END_DATE)
    
    # Issue type
    issue_type = random.choice(ISSUE_TYPES)
    
    # Resolution time varies by issue type and customer segment
    base_resolution = {
        'Product Defect': 24,
        'Delivery Issue': 12,
        'Billing': 4,
        'Technical Support': 8,
        'Returns': 16
    }
    
    resolution_time = base_resolution[issue_type]
    # VIP customers get faster resolution
    if customer_segment == 'VIP':
        resolution_time *= 0.7
    
    # Add some randomness
    resolution_time = round(resolution_time * random.uniform(0.5, 1.5), 1)
    
    # CSAT Score (1-5) - inversely correlated with resolution time
    if resolution_time < 6:
        csat = random.choices([4, 5], weights=[30, 70])[0]
    elif resolution_time < 12:
        csat = random.choices([3, 4, 5], weights=[20, 50, 30])[0]
    elif resolution_time < 24:
        csat = random.choices([2, 3, 4], weights=[30, 50, 20])[0]
    else:
        csat = random.choices([1, 2, 3], weights=[40, 40, 20])[0]
    
    support_tickets.append({
        'Ticket_ID': i,
        'Customer_ID': customer_id,
        'Date_ID': ticket_date.strftime('%Y-%m-%d'),
        'Issue_Type': issue_type,
        'Resolution_Time_Hours': resolution_time,
        'CSAT_Score': csat
    })

fact_support = pd.DataFrame(support_tickets)
fact_support.to_csv('data/fact_customer_support.csv', index=False)
print(f"✓ Generated {len(fact_support):,} customer support ticket records")
print(f"  - Avg Resolution Time: {fact_support['Resolution_Time_Hours'].mean():.1f} hours")
print(f"  - Avg CSAT Score: {fact_support['CSAT_Score'].mean():.2f}/5")

# ============================================================================
# Summary Statistics
# ============================================================================
print("\n" + "=" * 60)
print("✅ DATA GENERATION COMPLETE!")
print("=" * 60)
print(f"\n📊 Summary:")
print(f"  - Customers: {len(dim_customer):,} across {len(EU_COUNTRIES)} EU countries")
print(f"  - Products: {len(dim_product):,}")
print(f"  - Date Range: {START_DATE.strftime('%Y-%m-%d')} to {END_DATE.strftime('%Y-%m-%d')}")
print(f"  - Sales Transactions: {len(fact_sales):,}")
print(f"  - Subscriptions: {len(fact_subscription):,}")
print(f"  - Support Tickets: {len(fact_support):,}")
print(f"\n💰 Financial Summary:")
print(f"  - Total Gross Revenue: ${fact_sales['Gross_Revenue'].sum():,.2f}")
print(f"  - Total Discounts: ${fact_sales['Discount_Amount'].sum():,.2f}")
print(f"  - Total Net Revenue: ${fact_sales['Net_Revenue'].sum():,.2f}")
print(f"  - Total Profit: ${fact_sales['Profit'].sum():,.2f}")
print(f"  - Profit Margin: {(fact_sales['Profit'].sum() / fact_sales['Net_Revenue'].sum() * 100):.1f}%")
print(f"\n📁 Files saved in 'data/' directory:")
print(f"  - dim_date.csv")
print(f"  - dim_customer.csv")
print(f"  - dim_product.csv")
print(f"  - dim_channel.csv")
print(f"  - dim_churn_reason.csv")
print(f"  - fact_sales.csv")
print(f"  - fact_subscription.csv")
print(f"  - fact_customer_support.csv")
print("\n" + "=" * 60)
