const AppSchemas = {
    sales: {
        id: 'sales',
        title: 'نظام إدارة المبيعات',
        desc: 'إدارة الطلبات، العملاء، والعمليات المالية',
        fields: [
            { id: 'orderId', label: 'رقم الطلب', type: 'text', readonly: true, width: '150px' },
            { id: 'orderDate', label: 'تاريخ الطلب', type: 'date', required: true },
            { id: 'shipDate', label: 'تاريخ الشحن', type: 'date' },
            { id: 'deliveryDate', label: 'تاريخ التسليم', type: 'date' },
            { id: 'orderStatus', label: 'حالة الطلب', type: 'select', options: ['Completed', 'Pending', 'Shipped', 'Cancelled', 'Returned'] },
            { id: 'customerId', label: 'رقم العميل', type: 'text', readonly: true },
            { id: 'customerSegment', label: 'شريحة العميل', type: 'select', options: ['Enterprise', 'SMB', 'Individual', 'Government', 'Education'] },
            { id: 'region', label: 'المنطقة', type: 'select', options: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'], onChange: 'updateCountries' },
            { id: 'country', label: 'الدولة', type: 'select', options: [] }, // Populated dynamically
            { id: 'productCategory', label: 'فئة المنتج', type: 'select', options: ['Electronics', 'Furniture', 'Office Supplies', 'Clothing', 'Food & Beverages'], onChange: 'updateProducts' },
            { id: 'productName', label: 'اسم المنتج', type: 'select', options: [] }, // Populated dynamically
            { id: 'quantity', label: 'الكمية', type: 'number', required: true, onChange: 'calculateTotals' },
            { id: 'unitPrice', label: 'سعر الوحدة', type: 'number', required: true, onChange: 'calculateTotals' },
            { id: 'grossSales', label: 'إجمالي المبيعات', type: 'money', readonly: true },
            { id: 'discountPercent', label: 'نسبة الخصم %', type: 'select', options: [0, 5, 10, 15, 20, 25], onChange: 'calculateTotals' },
            { id: 'discountAmount', label: 'قيمة الخصم', type: 'money', readonly: true },
            { id: 'netSales', label: 'صافي المبيعات', type: 'money', readonly: true },
            { id: 'costOfGoods', label: 'تكلفة البضاعة', type: 'number', onChange: 'calculateTotals' },
            { id: 'profit', label: 'الربح', type: 'money', readonly: true },
            { id: 'profitMargin', label: 'هامش الربح %', type: 'percent', readonly: true },
            { id: 'salesChannel', label: 'قناة البيع', type: 'select', options: ['Direct Sales', 'Online', 'Retail', 'Partner', 'Distributor'] },
            { id: 'paymentMethod', label: 'طريقة الدفع', type: 'select', options: ['Credit Card', 'Bank Transfer', 'PayPal', 'Check', 'Cash'] },
            { id: 'salesRepName', label: 'مندوب المبيعات', type: 'select', options: [] } // Populated from config
        ],
        config: {
            countriesByRegion: {
                'North America': ['USA', 'Canada', 'Mexico'],
                'Europe': ['Germany', 'UK', 'France', 'Italy', 'Spain', 'Netherlands'],
                'Asia Pacific': ['China', 'Japan', 'India', 'Australia', 'Singapore', 'South Korea'],
                'Latin America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
                'Middle East & Africa': ['UAE', 'Saudi Arabia', 'South Africa', 'Egypt', 'Nigeria']
            },
            productsByCategory: {
                'Electronics': ['Laptop', 'Desktop Computer', 'Tablet', 'Smartphone', 'Monitor'],
                'Furniture': ['Office Chair', 'Desk', 'Filing Cabinet', 'Sofa'],
                'Office Supplies': ['Paper', 'Pens', 'Notebooks', 'Binders'],
                'Clothing': ['Suit', 'Shirt', 'Pants', 'Shoes'],
                'Food & Beverages': ['Coffee', 'Tea', 'Snacks', 'Water']
            },
            salesReps: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'Jennifer Lee']
        },
        handlers: {
            updateCountries: (val, form) => {
                const countries = AppSchemas.sales.config.countriesByRegion[val] || [];
                engine.populateSelect('country', countries);
            },
            updateProducts: (val, form) => {
                const products = AppSchemas.sales.config.productsByCategory[val] || [];
                engine.populateSelect('productName', products);
            },
            calculateTotals: (form) => {
                const qty = parseFloat(form['quantity'].value) || 0;
                const price = parseFloat(form['unitPrice'].value) || 0;
                const discPct = parseFloat(form['discountPercent'].value) || 0;
                const cost = parseFloat(form['costOfGoods'].value) || 0;

                const gross = qty * price;
                const discAmt = gross * (discPct / 100);
                const net = gross - discAmt;
                const profit = net - cost;
                const margin = net > 0 ? (profit / net) * 100 : 0;

                form['grossSales'].value = gross.toFixed(2);
                form['discountAmount'].value = discAmt.toFixed(2);
                form['netSales'].value = net.toFixed(2);
                form['profit'].value = profit.toFixed(2);
                form['profitMargin'].value = margin.toFixed(2);
            }
        }
    },

    employees: {
        id: 'employees',
        title: 'نظام إدارة الموارد البشرية HR',
        desc: 'إدارة سجلات الموظفين، الرواتب، والأقسام',
        fields: [
            { id: 'empId', label: 'رقم الموظف', type: 'text', readonly: true },
            { id: 'fullName', label: 'الاسم رباعي', type: 'text' },
            { id: 'department', label: 'القسم', type: 'select', options: ['HR', 'IT', 'Marketing', 'Sales', 'Finance', 'Operations'] },
            { id: 'position', label: 'المسمى الوظيفي', type: 'select', options: ['Manager', 'Senior Developer', 'Junior Developer', 'Accountant', 'HR Specialist', 'Sales Rep'] },
            { id: 'joinDate', label: 'تاريخ التعيين', type: 'date' },
            { id: 'contractType', label: 'نوع العقد', type: 'select', options: ['Full Time', 'Part Time', 'Freelance', 'Contract'] },
            { id: 'basicSalary', label: 'الراتب الأساسي', type: 'number', required: true, onChange: 'calcSalary' },
            { id: 'incentives', label: 'الحوافز', type: 'number', onChange: 'calcSalary' },
            { id: 'deductions', label: 'الاستقطاعات', type: 'number', onChange: 'calcSalary' },
            { id: 'netSalary', label: 'صافي الراتب', type: 'money', readonly: true },
            { id: 'status', label: 'الحالة', type: 'select', options: ['Active', 'On Leave', 'Resigned', 'Terminated'] }
        ],
        config: {},
        handlers: {
            calcSalary: (val, form) => {
                const basic = parseFloat(form['basicSalary'].value) || 0;
                const inc = parseFloat(form['incentives'].value) || 0;
                const ded = parseFloat(form['deductions'].value) || 0;
                form['netSalary'].value = (basic + inc - ded).toFixed(2);
            }
        }
    },

    inventory: {
        id: 'inventory',
        title: 'نظام إدارة المخازن Inventory',
        desc: 'تتبع المخزون، حركة الأصناف، وإعادة الطلب',
        fields: [
            { id: 'inventoryId', label: 'رقم السجل', type: 'text', readonly: true },
            { id: 'productId', label: 'رقم المنتج', type: 'text' },
            { id: 'productName', label: 'اسم المنتج', type: 'text' },
            { id: 'warehouse', label: 'المخزن', type: 'select', options: ['WH-Cairo', 'WH-Giza', 'WH-Alex', 'WH-Delta'] },
            { id: 'stockQty', label: 'الكمية المتاحة', type: 'number', required: true },
            { id: 'reorderLevel', label: 'حد إعادة الطلب', type: 'number' },
            { id: 'lastUpdated', label: 'آخر تحديث', type: 'date' },
            { id: 'status', label: 'حالة المخزون', type: 'select', options: ['In Stock', 'Low Stock', 'Out of Stock'] }
        ],
        config: {},
        handlers: {}
    },

    attendance: {
        id: 'attendance',
        title: 'سجل الحضور والانصراف Attendance',
        desc: 'متابعة ساعات العمل، الحضور، والغياب',
        fields: [
            { id: 'attId', label: 'رقم السجل', type: 'text', readonly: true },
            { id: 'empId', label: 'رقم الموظف', type: 'text' },
            { id: 'date', label: 'التاريخ', type: 'date', required: true },
            { id: 'checkIn', label: 'وقت الحضور', type: 'time' },
            { id: 'checkOut', label: 'وقت الانصراف', type: 'time', onChange: 'calcHours' },
            { id: 'workingHours', label: 'ساعات العمل', type: 'number', readonly: true },
            { id: 'overtime', label: 'ساعات إضافية', type: 'number' },
            { id: 'absenceType', label: 'نوع الغياب', type: 'select', options: ['Present', 'Sick Leave', 'Casual Leave', 'Unpaid', 'Remote'] }
        ],
        config: {},
        handlers: {
            calcHours: (val, form) => {
                const inTime = form['checkIn'].value;
                const outTime = form['checkOut'].value;
                if (inTime && outTime) {
                    const start = new Date(`2000-01-01T${inTime}`);
                    const end = new Date(`2000-01-01T${outTime}`);
                    const diff = (end - start) / 1000 / 60 / 60; // hours
                    form['workingHours'].value = diff > 0 ? diff.toFixed(2) : 0;
                }
            }
        }
    },

    customers: {
        id: 'customers',
        title: 'قاعدة بيانات العملاء CRM',
        desc: 'بيانات العملاء، جهات الاتصال، والحالة',
        fields: [
            { id: 'custId', label: 'رقم العميل', type: 'text', readonly: true },
            { id: 'custName', label: 'اسم العميل', type: 'text', required: true },
            { id: 'custType', label: 'نوع العميل', type: 'select', options: ['Corporate', 'Individual', 'Government', 'SMB'] },
            { id: 'industry', label: 'المجال', type: 'select', options: ['Construction', 'Retail', 'Technology', 'Healthcare', 'Finance'] },
            { id: 'phone', label: 'رقم الهاتف', type: 'text' },
            { id: 'email', label: 'البريد الإلكتروني', type: 'text' },
            { id: 'city', label: 'المدينة', type: 'select', options: ['Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Luxor'] },
            { id: 'country', label: 'الدولة', type: 'text', readonly: true, value: 'Egypt' },
            { id: 'regDate', label: 'تاريخ التسجيل', type: 'date' },
            { id: 'status', label: 'حالة العميل', type: 'select', options: ['Active', 'Inactive', 'Lead', 'Blacklisted'] }
        ],
        config: {},
        handlers: {}
    },

    purchasing: {
        id: 'purchasing',
        title: 'إدارة المشتريات Purchasing',
        desc: 'أوامر الشراء واتفاقيات التوريد',
        fields: [
            { id: 'poId', label: 'رقم أمر الشراء', type: 'text', readonly: true },
            { id: 'suppId', label: 'رقم المورد', type: 'text' },
            { id: 'orderDate', label: 'تاريخ الطلب', type: 'date' },
            { id: 'prodId', label: 'رقم المنتج', type: 'text' },
            { id: 'qty', label: 'الكمية', type: 'number', onChange: 'calcTotal' },
            { id: 'unitCost', label: 'تكلفة الوحدة', type: 'number', onChange: 'calcTotal' },
            { id: 'totalCost', label: 'إجمالي التكلفة', type: 'money', readonly: true },
            { id: 'delDate', label: 'تاريخ التسليم', type: 'date' },
            { id: 'status', label: 'حالة الطلب', type: 'select', options: ['Pending', 'Approved', 'Received', 'Cancelled'] }
        ],
        config: {},
        handlers: {
            calcTotal: (val, form) => {
                const q = parseFloat(form['qty'].value) || 0;
                const c = parseFloat(form['unitCost'].value) || 0;
                form['totalCost'].value = (q * c).toFixed(2);
            }
        }
    },

    suppliers: {
        id: 'suppliers',
        title: 'سجلات الموردين Suppliers',
        desc: 'بيانات الموردين وتقييماتهم',
        fields: [
            { id: 'suppId', label: 'رقم المورد', type: 'text', readonly: true },
            { id: 'suppName', label: 'اسم المورد', type: 'text', required: true },
            { id: 'contact', label: 'مسؤول التواصل', type: 'text' },
            { id: 'phone', label: 'الهاتف', type: 'text' },
            { id: 'email', label: 'البريد', type: 'text' },
            { id: 'city', label: 'المدينة', type: 'text' },
            { id: 'terms', label: 'شروط السداد', type: 'select', options: ['Net 30', 'Net 60', 'Cash', 'Advance'] },
            { id: 'rating', label: 'التقييم (1-5)', type: 'select', options: [1, 2, 3, 4, 5] }
        ],
        config: {},
        handlers: {}
    },

    finance: {
        id: 'finance',
        title: 'النظام المالي Finance',
        desc: 'القيود اليومية والعمليات المحاسبية',
        fields: [
            { id: 'transId', label: 'رقم العملية', type: 'text', readonly: true },
            { id: 'transDate', label: 'تاريخ العملية', type: 'date' },
            { id: 'account', label: 'الحساب', type: 'select', options: ['Revenue', 'Expense', 'Asset', 'Liability', 'Equity'] },
            { id: 'type', label: 'نوع القيد', type: 'select', options: ['Debit', 'Credit'] },
            { id: 'amount', label: 'المبلغ', type: 'number', required: true },
            { id: 'costCenter', label: 'مركز التكلفة', type: 'select', options: ['Sales', 'HR', 'IT', 'Admin', 'Production'] },
            { id: 'currency', label: 'العملة', type: 'select', options: ['EGP', 'USD', 'EUR', 'SAR'] }
        ],
        config: {},
        handlers: {}
    },

    support: {
        id: 'support',
        title: 'خدمة العملاء Customer Support',
        desc: 'تذاكر الدعم والشكاوى',
        fields: [
            { id: 'ticketId', label: 'رقم التذكرة', type: 'text', readonly: true },
            { id: 'custId', label: 'رقم العميل', type: 'text' },
            { id: 'issueType', label: 'نوع المشكلة', type: 'select', options: ['Complaint', 'Inquiry', 'Technical Issue', 'Billing', 'Feature Request'] },
            { id: 'openDate', label: 'تاريخ الفتح', type: 'date' },
            { id: 'closeDate', label: 'تاريخ الإغلاق', type: 'date' },
            { id: 'status', label: 'الحالة', type: 'select', options: ['Open', 'In Progress', 'Resolved', 'Closed'] },
            { id: 'score', label: 'رضا العميل (1-5)', type: 'select', options: [1, 2, 3, 4, 5] }
        ],
        config: {},
        handlers: {}
    },

    operations: {
        id: 'operations',
        title: 'العمليات والصيانة Operations',
        desc: 'أوامر العمل وصيانة الأصول',
        fields: [
            { id: 'workOrder', label: 'أمر العمل', type: 'text', readonly: true },
            { id: 'assetId', label: 'رقم الأصل', type: 'text' },
            { id: 'type', label: 'نوع الصيانة', type: 'select', options: ['Preventive', 'Corrective', 'Emergency', 'Inspection'] },
            { id: 'startDate', label: 'تاريخ البدء', type: 'date' },
            { id: 'endDate', label: 'تاريخ الانتهاء', type: 'date' },
            { id: 'cost', label: 'التكلفة', type: 'money' },
            { id: 'tech', label: 'الفني المسؤول', type: 'text' }
        ],
        config: {},
        handlers: {}
    }
};
