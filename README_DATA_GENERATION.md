# 🚀 Enterprise BI Data Generation System

## نظرة عامة

نظام توليد بيانات شامل لمنصة تجارة إلكترونية قائمة على الاشتراكات تعمل في جميع دول الاتحاد الأوروبي الـ27.

**العملة:** USD 💵

## 📊 البيانات المولّدة

### Dimension Tables (جداول الأبعاد)

1. **`dim_date.csv`** - بُعد التاريخ
   - 1,461 سجل (2023-2026)
   - Date_ID, Day, Month, Quarter, Year, Is_Holiday

2. **`dim_customer.csv`** - بُعد العملاء
   - 10,000 عميل
   - Customer_ID, Gender, Age_Group, City, Country, Customer_Segment, Acquisition_Channel
   - يغطي جميع دول الاتحاد الأوروبي الـ27

3. **`dim_product.csv`** - بُعد المنتجات
   - 500 منتج
   - Product_ID, Category, Brand, Price_Tier, Unit_Price, Cost_Price
   - 7 فئات: Electronics, Fashion, Home & Garden, Sports, Beauty, Books, Toys

4. **`dim_channel.csv`** - قنوات التسويق
   - 8 قنوات
   - Channel_ID, Channel_Type, Campaign_Name

5. **`dim_churn_reason.csv`** - أسباب إلغاء الاشتراك
   - 7 أسباب
   - Churn_Reason_ID, Category, Reason

### Fact Tables (جداول الحقائق)

1. **`fact_sales.csv`** - معاملات البيع
   - ~100,000 معاملة
   - Sales_ID, Date_ID, Customer_ID, Product_ID, Channel_ID, Subscription_ID
   - Quantity, Gross_Revenue, Discount_Amount, Net_Revenue, Cost, Profit

2. **`fact_subscription.csv`** - الاشتراكات
   - 15,000 اشتراك (70% نشط، 30% ملغي)
   - Subscription_ID, Customer_ID, Start_Date, End_Date, Plan_ID
   - Monthly_Fee, Status, Churn_Reason_ID, Lifetime_Value
   - 3 خطط: Basic ($9.99), Standard ($19.99), Premium ($39.99)

3. **`fact_customer_support.csv`** - تذاكر الدعم الفني
   - 8,000 تذكرة
   - Ticket_ID, Customer_ID, Date_ID, Issue_Type
   - Resolution_Time_Hours, CSAT_Score

## 🎯 كيفية الاستخدام

### 1. تثبيت المتطلبات

```bash
pip install -r requirements.txt
```

المكتبات المطلوبة:
- `pandas` - معالجة البيانات
- `numpy` - العمليات الرياضية
- `faker` - توليد بيانات واقعية

### 2. تشغيل السكريبت

```bash
python generate_enterprise_data.py
```

### 3. المخرجات

ستجد 8 ملفات CSV في مجلد `data/`:

```
data/
├── dim_date.csv
├── dim_customer.csv
├── dim_product.csv
├── dim_channel.csv
├── dim_churn_reason.csv
├── fact_sales.csv
├── fact_subscription.csv
└── fact_customer_support.csv
```

## 📈 مميزات البيانات

### ✅ واقعية
- توزيع العملاء حسب حجم سكان دول الاتحاد الأوروبي
- أنماط مبيعات موسمية (زيادة في Q4)
- خصومات في المناسبات (Black Friday، العطلات)
- علاقة بين وقت الحل و CSAT Score
- معدلات Churn واقعية (أعلى في أول 3 شهور)

### ✅ شاملة
- جميع الأعمدة المطلوبة للتحليلات
- علاقات سليمة بين الجداول (Referential Integrity)
- حسابات دقيقة (Profit = Net_Revenue - Cost)
- فترة زمنية كافية للتحليلات (4 سنوات)

### ✅ جاهزة للتحليل
يمكن استخراج KPIs مثل:

**مؤشرات مالية:**
- إجمالي الإيرادات
- هامش الربح
- متوسط قيمة الطلب (AOV)
- Customer Lifetime Value (CLV)

**مؤشرات تشغيلية:**
- معدل Churn
- متوسط وقت حل التذاكر
- معدل رضا العملاء (CSAT)
- معدل التحويل بالقنوات

**مؤشرات استراتيجية:**
- نمو الإيرادات حسب الدولة
- أداء المنتجات حسب الفئة
- ROI للحملات التسويقية
- معدل الاحتفاظ بالعملاء

## 🔧 التخصيص

يمكنك تعديل المتغيرات في بداية السكريبت:

```python
NUM_CUSTOMERS = 10000        # عدد العملاء
NUM_PRODUCTS = 500           # عدد المنتجات
NUM_SALES = 100000          # عدد المبيعات
NUM_SUBSCRIPTIONS = 15000   # عدد الاشتراكات
NUM_SUPPORT_TICKETS = 8000  # عدد التذاكر
```

## 📊 أمثلة على التحليلات

### مثال 1: إجمالي المبيعات حسب الدولة

```python
import pandas as pd

sales = pd.read_csv('data/fact_sales.csv')
customers = pd.read_csv('data/dim_customer.csv')

# دمج البيانات
sales_by_country = sales.merge(customers, on='Customer_ID')

# حساب الإيرادات حسب الدولة
revenue_by_country = sales_by_country.groupby('Country')['Net_Revenue'].sum().sort_values(ascending=False)
print(revenue_by_country)
```

### مثال 2: معدل Churn

```python
import pandas as pd

subscriptions = pd.read_csv('data/fact_subscription.csv')

total_subs = len(subscriptions)
churned = len(subscriptions[subscriptions['Status'] == 'Churned'])
churn_rate = (churned / total_subs) * 100

print(f"Churn Rate: {churn_rate:.2f}%")
```

### مثال 3: أداء المنتجات

```python
import pandas as pd

sales = pd.read_csv('data/fact_sales.csv')
products = pd.read_csv('data/dim_product.csv')

# دمج البيانات
sales_products = sales.merge(products, on='Product_ID')

# أفضل الفئات ربحاً
top_categories = sales_products.groupby('Category')['Profit'].sum().sort_values(ascending=False)
print(top_categories)
```

## 🌍 دول الاتحاد الأوروبي المشمولة

جميع الـ27 دولة:
- 🇩🇪 Germany, 🇫🇷 France, 🇮🇹 Italy, 🇪🇸 Spain
- 🇵🇱 Poland, 🇳🇱 Netherlands, 🇧🇪 Belgium
- 🇬🇷 Greece, 🇵🇹 Portugal, 🇨🇿 Czech Republic
- 🇸🇪 Sweden, 🇭🇺 Hungary, 🇦🇹 Austria
- 🇷🇴 Romania, 🇩🇰 Denmark, 🇫🇮 Finland
- 🇸🇰 Slovakia, 🇮🇪 Ireland, 🇭🇷 Croatia
- 🇱🇹 Lithuania, 🇸🇮 Slovenia, 🇱🇻 Latvia
- 🇪🇪 Estonia, 🇨🇾 Cyprus, 🇱🇺 Luxembourg
- 🇲🇹 Malta, 🇧🇬 Bulgaria

## 📧 ملاحظات

- البيانات مُولّدة عشوائياً لأغراض التدريب والتحليل
- الأسماء والمدن مُولّدة باستخدام مكتبة Faker
- جميع الأسعار بالدولار الأمريكي (USD)
- البيانات متسقة منطقياً (مثلاً: العملاء VIP لديهم أولوية في الدعم الفني)

---

**تم الإنشاء بواسطة:** Enterprise Data Generation System  
**التاريخ:** January 2026  
**الإصدار:** 1.0
