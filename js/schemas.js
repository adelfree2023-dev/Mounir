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
    },

    // --- PHASE 2: MARKETING ---
    campaigns: {
        id: 'campaigns',
        title: 'إدارة الحملات التسويقية Marketing Campaigns',
        desc: 'تخطيط وتتبع الحملات الإعلانية وميزانياتها',
        fields: [
            { id: 'campId', label: 'رقم الحملة', type: 'text', readonly: true },
            { id: 'campName', label: 'اسم الحملة', type: 'text', required: true },
            { id: 'platform', label: 'المنصة', type: 'select', options: ['Facebook', 'Instagram', 'Google Ads', 'LinkedIn', 'TikTok', 'Email', 'TV', 'Radio'] },
            { id: 'objective', label: 'الهدف', type: 'select', options: ['Brand Awareness', 'Lead Gen', 'Sales', 'Traffic', 'App Installs'] },
            { id: 'startDate', label: 'تاريخ البدء', type: 'date', required: true },
            { id: 'endDate', label: 'تاريخ الانتهاء', type: 'date' },
            { id: 'budget', label: 'الميزانية (EGP)', type: 'number', required: true, onChange: 'calcRoi' },
            { id: 'spend', label: 'الإنفاق الفعلي', type: 'number', required: true, onChange: 'calcRoi' },
            { id: 'revenue', label: 'العائد المحقق', type: 'number', required: true, onChange: 'calcRoi' },
            { id: 'roi', label: 'العائد على الاستثمار ROI %', type: 'percent', readonly: true },
            { id: 'status', label: 'الحالة', type: 'select', options: ['Planned', 'Active', 'Paused', 'Completed'] }
        ],
        config: {},
        handlers: {
            calcRoi: (val, form) => {
                const rev = parseFloat(form['revenue'].value) || 0;
                const spend = parseFloat(form['spend'].value) || 0;
                if (spend > 0) {
                    const roi = ((rev - spend) / spend) * 100;
                    form['roi'].value = roi.toFixed(2);
                } else {
                    form['roi'].value = 0;
                }
            }
        }
    },

    ads: {
        id: 'ads',
        title: 'أداء الإعلانات Ads Performance',
        desc: 'تتبع مقاييس الإعلانات التفصيلية',
        fields: [
            { id: 'adId', label: 'رقم الإعلان', type: 'text', readonly: true },
            { id: 'campId', label: 'رقم الحملة', type: 'text' },
            { id: 'adName', label: 'عنوان الإعلان', type: 'text' },
            { id: 'type', label: 'نوع الإعلان', type: 'select', options: ['Image', 'Video', 'Carousel', 'Story', 'Text'] },
            { id: 'impressions', label: 'الظهور (Impressions)', type: 'number', onChange: 'calcCtr' },
            { id: 'clicks', label: 'النقرات (Clicks)', type: 'number', onChange: 'calcCtr' },
            { id: 'ctr', label: 'نسبة النقر CTR %', type: 'percent', readonly: true },
            { id: 'conversions', label: 'التحويلات (Sales/Leads)', type: 'number', onChange: 'calcCpa' },
            { id: 'cost', label: 'التكلفة', type: 'number', onChange: 'calcCpa' },
            { id: 'cpa', label: 'تكلفة التحويل CPA', type: 'money', readonly: true },
            { id: 'qualityScore', label: 'نقاط الجودة (1-10)', type: 'select', options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
        ],
        config: {},
        handlers: {
            calcCtr: (val, form) => {
                const imps = parseFloat(form['impressions'].value) || 0;
                const clicks = parseFloat(form['clicks'].value) || 0;
                const ctr = imps > 0 ? (clicks / imps) * 100 : 0;
                form['ctr'].value = ctr.toFixed(2);
            },
            calcCpa: (val, form) => {
                const cost = parseFloat(form['cost'].value) || 0;
                const conv = parseFloat(form['conversions'].value) || 0;
                const cpa = conv > 0 ? cost / conv : 0;
                form['cpa'].value = cpa.toFixed(2);
            }
        }
    },

    leads: {
        id: 'leads',
        title: 'إدارة العملاء المحتملين Leads',
        desc: 'تتبع العملاء المحتملين ومراحل البيع',
        fields: [
            { id: 'leadId', label: 'رقم العميل المحتمل', type: 'text', readonly: true },
            { id: 'leadName', label: 'الاسم', type: 'text', required: true },
            { id: 'source', label: 'المصدر', type: 'select', options: ['Website', 'Facebook', 'Referral', 'Cold Call', 'Event'] },
            { id: 'phone', label: 'الهاتف', type: 'text' },
            { id: 'interest', label: 'الاهتمام', type: 'select', options: ['Product A', 'Product B', 'Service X', 'Consultation'] },
            { id: 'score', label: 'درجة الأهمية (Lead Score)', type: 'number' },
            { id: 'assignedTo', label: 'المسؤول', type: 'text' },
            { id: 'lastContact', label: 'آخر تواصل', type: 'date' },
            { id: 'status', label: 'المرحلة', type: 'select', options: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'] }
        ],
        config: {},
        handlers: {}
    },

    social_media: {
        id: 'social_media',
        title: 'جدول المحتوى Social Content',
        desc: 'تخطيط ونشر محتوى التواصل الاجتماعي',
        fields: [
            { id: 'postId', label: 'رقم المنشور', type: 'text', readonly: true },
            { id: 'platform', label: 'المنصة', type: 'select', options: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'] },
            { id: 'contentType', label: 'نوع المحتوى', type: 'select', options: ['Image Post', 'Video', 'Reel', 'Story', 'Article', 'Poll'] },
            { id: 'topic', label: 'الموضوع', type: 'text' },
            { id: 'publishDate', label: 'موعد النشر', type: 'date' },
            { id: 'publishTime', label: 'وقت النشر', type: 'time' },
            { id: 'author', label: 'كاتب المحتوى', type: 'text' },
            { id: 'designer', label: 'المصمم', type: 'text' },
            { id: 'status', label: 'الحالة', type: 'select', options: ['Idea', 'Drafting', 'Design', 'Approved', 'Scheduled', 'Published'] },
            { id: 'likes', label: 'الإعجابات (بعد النشر)', type: 'number' },
            { id: 'comments', label: 'التعليقات', type: 'number' },
            { id: 'shares', label: 'المشاركات', type: 'number' }
        ],
        config: {},
        handlers: {}
    },

    analytics: {
        id: 'analytics',
        title: 'تحليل الموقع Website Analytics',
        desc: 'إحصائيات الزيارات والأداء للموقع',
        fields: [
            { id: 'reportId', label: 'رقم التقرير', type: 'text', readonly: true },
            { id: 'pageUrl', label: 'رابط الصفحة', type: 'text' },
            { id: 'date', label: 'التاريخ', type: 'date' },
            { id: 'visitors', label: 'الزوار الجدد', type: 'number' },
            { id: 'pageViews', label: 'عدد المشاهدات', type: 'number' },
            { id: 'avgTime', label: 'متوسط الوقت (دقيقة)', type: 'number' },
            { id: 'bounceRate', label: 'معدل الارتداد %', type: 'percent' },
            { id: 'trafficSource', label: 'أعلى مصدر زيارات', type: 'select', options: ['Organic Search', 'Direct', 'Social', 'Referral', 'Email'] },
            { id: 'deviceByUser', label: 'أعلى جهاز', type: 'select', options: ['Mobile', 'Desktop', 'Tablet'] }
        ],
        config: {},
        handlers: {}
    },

    // --- PHASE 3: IT & TECH ---
    it_inventory: {
        id: 'it_inventory',
        title: 'إدارة الأصول التقنية IT Assets',
        desc: 'تتبع الأجهزة، العهد، والصيانة',
        fields: [
            { id: 'tagId', label: 'رقم الأصل (Tag ID)', type: 'text', readonly: true },
            { id: 'type', label: 'نوع الجهاز', type: 'select', options: ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Scanner', 'Server', 'Networking'] },
            { id: 'brand', label: 'الماركة', type: 'select', options: ['Dell', 'HP', 'Lenovo', 'Apple', 'Cisco', 'Samsung'] },
            { id: 'model', label: 'الموديل', type: 'text', required: true },
            { id: 'serial', label: 'الرقم التسلسلي', type: 'text', required: true },
            { id: 'assignedTo', label: 'مسؤول العهدة (الموظف)', type: 'text' },
            { id: 'purchaseDate', label: 'تاريخ الشراء', type: 'date' },
            { id: 'warrantyExp', label: 'انتهاء الضمان', type: 'date' },
            { id: 'cost', label: 'التكلفة', type: 'money' },
            { id: 'status', label: 'الحالة', type: 'select', options: ['In Use', 'In Stock', 'Under Repair', 'Retired', 'Lost'] }
        ],
        config: {},
        handlers: {}
    },

    software_licenses: {
        id: 'software_licenses',
        title: 'تراخيص البرامج Software Licenses',
        desc: 'إدارة اشتراكات البرمجيات وتواريخ التجديد',
        fields: [
            { id: 'licenseId', label: 'رقم الترخيص', type: 'text', readonly: true },
            { id: 'softwareName', label: 'اسم البرنامج', type: 'text', required: true },
            { id: 'vendor', label: 'الشركة المنتجة', type: 'text' },
            { id: 'type', label: 'نوع الترخيص', type: 'select', options: ['SaaS Subscription', 'Perpetual', 'Open Source', 'Enterprise'] },
            { id: 'seats', label: 'عدد المستخدمين', type: 'number' },
            { id: 'key', label: 'مفتاح التفعيل', type: 'text' },
            { id: 'purchaseDate', label: 'تاريخ الشراء', type: 'date' },
            { id: 'expiryDate', label: 'تاريخ التجديد', type: 'date', required: true },
            { id: 'cost', label: 'التكلفة السنوية', type: 'money' },
            { id: 'status', label: 'حالة الترخيص', type: 'select', options: ['Active', 'Expired', 'Near Expiry', 'Cancelled'] }
        ],
        config: {},
        handlers: {}
    },

    it_tickets: {
        id: 'it_tickets',
        title: 'تذاكر الدعم الفني IT Helpdesk',
        desc: 'الدعم الفني الداخلي ومتابعة المشاكل التقنية',
        fields: [
            { id: 'ticketId', label: 'رقم التذكرة', type: 'text', readonly: true },
            { id: 'requester', label: 'مقدم الطلب', type: 'text', required: true },
            { id: 'department', label: 'القسم', type: 'select', options: ['Sales', 'HR', 'Finance', 'Marketing', 'Ops'] },
            { id: 'category', label: 'التصنيف', type: 'select', options: ['Hardware', 'Software', 'Network', 'Email', 'Access', 'Security'] },
            { id: 'priority', label: 'الأولوية', type: 'select', options: ['High', 'Medium', 'Low', 'Critical'] },
            { id: 'subject', label: 'الموضوع', type: 'text', required: true },
            { id: 'assignedAgent', label: 'الفني المسؤول', type: 'text' },
            { id: 'createdDate', label: 'تاريخ الإنشاء', type: 'date' },
            { id: 'status', label: 'الحالة', type: 'select', options: ['Open', 'In Progress', 'Waiting User', 'Resolved', 'Closed'] }
        ],
        config: {},
        handlers: {}
    },

    server_status: {
        id: 'server_status',
        title: 'حالة السيرفرات Server Status',
        desc: 'مراقبة البنية التحتية والسيرفرات',
        fields: [
            { id: 'serverId', label: 'رقم السيرفر (ID)', type: 'text', readonly: true },
            { id: 'hostname', label: 'اسم المضيف (Hostname)', type: 'text', required: true },
            { id: 'ipAddress', label: 'عنوان IP', type: 'text' },
            { id: 'os', label: 'نظام التشغيل', type: 'select', options: ['Windows Server 2022', 'Ubuntu 22.04', 'CentOS 8', 'RedHat', 'Debian'] },
            { id: 'location', label: 'الموقع', type: 'select', options: ['On-Premise', 'AWS', 'Azure', 'Google Cloud', 'DigitalOcean'] },
            { id: 'cpuUsage', label: 'استهلاك المعالج %', type: 'percent' },
            { id: 'ramUsage', label: 'استهلاك الرام %', type: 'percent' },
            { id: 'diskUsage', label: 'استهلاك القرص %', type: 'percent' },
            { id: 'uptime', label: 'وقت التشغيل (أيام)', type: 'number' },
            { id: 'status', label: 'الحالة', type: 'select', options: ['Online', 'Offline', 'Maintenance', 'Degraded', 'Critical'] }
        ],
        config: {},
        handlers: {}
    },

    access_logs: {
        id: 'access_logs',
        title: 'سجلات الدخول Access Logs',
        desc: 'مراقبة أمن المعلومات وصلاحيات الدخول',
        fields: [
            { id: 'logId', label: 'رقم السجل', type: 'text', readonly: true },
            { id: 'userId', label: 'رقم المستخدم', type: 'text' },
            { id: 'username', label: 'اسم المستخدم', type: 'text' },
            { id: 'system', label: 'النظام', type: 'select', options: ['ERP', 'CRM', 'Email', 'VPN', 'File Server'] },
            { id: 'action', label: 'الحدث', type: 'select', options: ['Login', 'Logout', 'Failed Login', 'Password Change', 'File Access'] },
            { id: 'timestamp', label: 'الوقت والتاريخ', type: 'text' }, // We'll auto-fill generic TS
            { id: 'ipAddress', label: 'عنوان IP المصدر', type: 'text' },
            { id: 'riskLevel', label: 'مستوى الخطورة', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
            { id: 'status', label: 'النتيجة', type: 'select', options: ['Success', 'Failure', 'Blocked'] }
        ],
        config: {},
        handlers: {}
    }
};
