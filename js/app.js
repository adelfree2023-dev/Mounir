// --- 2. ENGINE CORE ---
const engine = {
    currentSchema: null,
    data: [],
    currentPage: 1,
    itemsPerPage: 25,
    editingIndex: -1,
    orderCounter: 1,

    init: function (schemaId) {
        // Switch Schema Logic
        if (this.currentSchema && this.currentSchema.id === schemaId) return;

        this.currentSchema = AppSchemas[schemaId];

        // Update dropdown UI text if custom select is used
        const trigger = document.querySelector('.custom-select__trigger span');
        if (trigger) trigger.textContent = this.currentSchema.title;

        // Close dropdown
        const select = document.querySelector('.custom-select');
        if (select) select.classList.remove('open');

        this.loadData();
        this.renderUI();

        // Initialize Reps if sales
        if (schemaId === 'sales') {
            this.populateSelect('salesRepName', this.currentSchema.config.salesReps);
        }

        // Submit Handler (Remove old listener to avoid duplicates if any)
        const oldForm = document.getElementById('dynamicForm');
        if (oldForm) {
            const newForm = oldForm.cloneNode(true);
            oldForm.parentNode.replaceChild(newForm, oldForm);

            newForm.onsubmit = (e) => {
                e.preventDefault();
                this.saveRecord();
            };
        }

        // NEW: Auto-fill form on schema switch for better UX
        setTimeout(() => {
            this.autoFill();
        }, 300); // Small delay to ensure all selects are populated
    },

    loadData: function () {
        const key = `data_${this.currentSchema.id}`;
        this.data = JSON.parse(localStorage.getItem(key)) || [];
        this.orderCounter = parseInt(localStorage.getItem(`counter_${this.currentSchema.id}`)) || 1;
    },

    renderUI: function () {
        document.getElementById('appTitle').textContent = `📊 ${this.currentSchema.title}`;
        document.getElementById('appDesc').textContent = this.currentSchema.desc;

        this.renderFormBuilder();
        this.renderTableHeaders();
        this.renderTableBody();
        this.updateStats();
        this.updateAnalyticsBadge(); // Update analytics button badge
        this.resetForm(); // Sets defaults
    },

    renderFormBuilder: function () {
        const container = document.getElementById('formContainer');
        container.innerHTML = this.currentSchema.fields.map(field => `
            <div class="form-group" style="grid-column: span ${field.width ? '2' : '1'}">
                <label>${field.label} ${field.required ? '*' : ''}</label>
                ${this.renderInput(field)}
            </div>
        `).join('');
    },

    renderInput: function (field) {
        if (field.type === 'select') {
            return `<select id="${field.id}" ${field.required ? 'required' : ''} onchange="engine.handleFieldChange('${field.id}')">
                <option value="">اختر...</option>
                ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>`;
        }
        return `<input type="${field.type === 'money' || field.type === 'percent' ? 'number' : field.type}" 
                       id="${field.id}" 
                       step="${field.type === 'money' || field.type === 'percent' ? '0.01' : '1'}"
                       ${field.readonly ? 'readonly' : ''} 
                       ${field.required ? 'required' : ''}
                       onchange="engine.handleFieldChange('${field.id}')">`;
    },

    handleFieldChange: function (fieldId) {
        const field = this.currentSchema.fields.find(f => f.id === fieldId);
        const form = document.getElementById('dynamicForm').elements;

        // Run field specific logic if any (onChange in schema)
        if (field.onChange && this.currentSchema.handlers[field.onChange]) {
            this.currentSchema.handlers[field.onChange](form[fieldId].value, form);
        }

        // Also run generic calculations if present in schema handlers (e.g. totals)
        if (this.currentSchema.handlers.calculateTotals) {
            this.currentSchema.handlers.calculateTotals(form);
        }
    },

    populateSelect: function (id, options) {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '<option value="">اختر...</option>' +
            options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    },

    saveRecord: function () {
        const record = {};
        // Validate required
        let valid = true;
        this.currentSchema.fields.forEach(f => {
            const el = document.getElementById(f.id);
            if (f.required && !el.value) valid = false;
        });

        if (!valid) {
            this.showToast('❌ يرجى ملء الحقول المطلوبة');
            return;
        }

        this.currentSchema.fields.forEach(f => {
            record[f.id] = document.getElementById(f.id).value;
        });

        if (this.editingIndex >= 0) {
            this.data[this.editingIndex] = record;
            this.editingIndex = -1;
            this.showToast('✅ تم التعديل بنجاح');
        } else {
            this.data.push(record);
            this.orderCounter++;
            localStorage.setItem(`counter_${this.currentSchema.id}`, this.orderCounter);
            this.showToast('✅ تم الإضافة بنجاح');
        }

        this.saveToStorage();
        this.renderTableBody();
        this.updateStats();
        this.resetForm();
    },

    saveToStorage: function () {
        localStorage.setItem(`data_${this.currentSchema.id}`, JSON.stringify(this.data));
    },

    // --- TABLE & DISPLAY ---
    renderTableHeaders: function () {
        const thead = document.getElementById('tableHead');
        const headers = ['الإجراءات', ...this.currentSchema.fields.map(f => f.label)];
        thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    },

    renderTableBody: function () {
        const tbody = document.getElementById('tableBody');
        const container = document.getElementById('paginationContainer');

        if (this.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100" style="text-align:center; padding: 50px;">📭 لا توجد بيانات</td></tr>';
            container.innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(this.data.length / this.itemsPerPage);
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageData = this.data.slice().reverse().slice(start, end); // Show newest first

        tbody.innerHTML = pageData.map((row, index) => {
            const actualIndex = this.data.length - 1 - (start + index);
            const cells = this.currentSchema.fields.map(f => `<td>${this.formatVal(row[f.id], f.type)}</td>`).join('');
            return `<tr>
                <td class="actions">
                    <button class="btn btn-danger btn-sm" onclick="engine.deleteRecord(${actualIndex})">🗑️</button>
                    <button class="btn btn-primary btn-sm" onclick="engine.editRecord(${actualIndex})">✏️</button>
                </td>
                ${cells}
            </tr>`;
        }).join('');

        this.renderPagination(totalPages);
    },

    formatVal: function (val, type) {
        if (type === 'money') return val ? `$${Number(val).toFixed(2)}` : '';
        if (type === 'percent') return val ? `${val}%` : '';
        return val || '';
    },

    renderPagination: function (totalPages) {
        const con = document.getElementById('paginationContainer');
        if (totalPages <= 1) { con.innerHTML = ''; return; }

        let html = `<button onclick="engine.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>◀</button>`;
        html += `<span class="pagination-info">${this.currentPage} / ${totalPages}</span>`;
        html += `<button onclick="engine.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>▶</button>`;
        con.innerHTML = html;
    },

    goToPage: function (p) {
        this.currentPage = p;
        this.renderTableBody();
    },

    // --- ACTIONS ---
    editRecord: function (index) {
        this.editingIndex = index;
        const rec = this.data[index];

        // Triggers generic fill
        this.currentSchema.fields.forEach(f => {
            const el = document.getElementById(f.id);
            if (el) {
                // Handlers need to run to populate dependents 
                if (f.id === 'region' && this.currentSchema.handlers.updateCountries) this.currentSchema.handlers.updateCountries(rec[f.id]);
                if (f.id === 'productCategory' && this.currentSchema.handlers.updateProducts) this.currentSchema.handlers.updateProducts(rec[f.id]);

                el.value = rec[f.id];
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showToast('📝 وضع التعديل');
    },

    deleteRecord: function (index) {
        if (confirm('حذف السجل؟')) {
            this.data.splice(index, 1);
            this.saveToStorage();
            this.renderTableBody();
            this.updateStats();
        }
    },

    clearAll: function () {
        if (confirm('حذف جميع البيانات؟')) {
            this.data = [];
            this.saveToStorage();
            this.renderTableBody();
            this.updateStats();
        }
    },

    resetForm: function () {
        document.getElementById('dynamicForm').reset();
        this.editingIndex = -1;

        // Generic Default
        if (this.currentSchema.id === 'inventory') {
            const sku = document.getElementById('sku');
            if (sku) sku.value = `SKU-${Math.floor(Math.random() * 100000) + 1000}`;

            const date = document.getElementById('lastRestock');
            if (date) date.value = new Date().toISOString().split('T')[0];
        }
        else {
            // Generic ID logic
            this.currentSchema.fields.forEach(f => {
                if (f.readonly && f.id.toLowerCase().includes('id')) {
                    const prefix = f.id.substring(0, 3).toUpperCase();
                    const el = document.getElementById(f.id);
                    if (el) el.value = `${prefix}-${2025}-${String(this.orderCounter).padStart(5, '0')}`;
                }
            });
        }
    },

    updateStats: function () {
        const con = document.getElementById('statsContainer');
        // Generic simple stats for now
        con.innerHTML = `
            <div class="stat-card">
                <div class="value">${this.data.length.toLocaleString()}</div>
                <div class="label">إجمالي السجلات</div>
            </div>
         `;
    },

    updateAnalyticsBadge: function () {
        const badge = document.getElementById('analyticsBadge');
        if (badge) {
            badge.textContent = this.data.length.toLocaleString();
        }
    },

    showToast: function (msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    },

    // --- GENERATORS ---
    autoFill: async function () {
        // Enhanced Auto-Fill: Better handling of dependent fields and realistic data
        const independentFields = this.currentSchema.fields.filter(f => !['country', 'productName'].includes(f.id));
        const dependentFields = this.currentSchema.fields.filter(f => ['country', 'productName'].includes(f.id));

        // Realistic names database
        const realisticNames = [
            'Ahmed Mohamed Ali', 'Mohamed Hassan Ibrahim', 'Fatma Ahmed Mahmoud', 'Sara Ali Hassan',
            'John Michael Smith', 'Sarah Elizabeth Johnson', 'Michael James Brown', 'Emily Rose Davis',
            'Hassan Kamel Fahmy', 'Laila Youssef Nabil', 'Omar Khaled Sayed', 'Mona Sherif Ahmed'
        ];

        const processField = async (f) => {
            const el = document.getElementById(f.id);

            // Skip if element doesn't exist
            if (!el) return;

            // Allow readonly fields that are calculated (totals, sales, salary, etc.)
            if (f.readonly && !f.id.includes('total') && !f.id.includes('Sales') &&
                !f.id.includes('Salary') && !f.id.includes('Margin') &&
                !f.id.includes('Amount') && f.id !== 'workingHours' &&
                !f.id.includes('profit') && !f.id.includes('roi') && !f.id.includes('ctr') &&
                !f.id.includes('cpa')) {
                return; // Skip non-calculated readonly fields (like IDs)
            }

            let val = '';
            let opts = f.options;

            // For Select fields, prefer DOM options (they might be updated dynamically)
            if (el.tagName === 'SELECT') {
                const domOpts = Array.from(el.options).filter(o => o.value !== "").map(o => o.value);
                if (domOpts.length > 0) opts = domOpts;
            }

            // Generate value based on field type
            if (opts && opts.length > 0) {
                val = opts[Math.floor(Math.random() * opts.length)];
            } else if (f.type === 'number' || f.type === 'money' || f.type === 'percent') {
                // Smart number generation based on field name
                if (!f.readonly) {
                    // Price fields - realistic prices
                    if (f.id.includes('Price') || f.id.includes('price') || f.id.includes('Cost') || f.id.includes('cost')) {
                        val = Math.floor(Math.random() * 500) + 50; // $50-550
                    }
                    // Quantity fields - realistic quantities
                    else if (f.id.includes('quantity') || f.id.includes('Quantity') || f.id.includes('qty')) {
                        val = Math.floor(Math.random() * 20) + 1; // 1-20
                    }
                    // Percent fields - realistic percentages
                    else if (f.type === 'percent' || f.id.includes('percent') || f.id.includes('rate')) {
                        val = Math.floor(Math.random() * 20); // 0-20%
                    }
                    // Amount fields - larger values
                    else if (f.id.includes('amount') || f.id.includes('Amount')) {
                        val = Math.floor(Math.random() * 10000) + 100; // $100-10,100
                    }
                    // Default - moderate values
                    else {
                        val = Math.floor(Math.random() * 200) + 1; // 1-200
                    }
                }
            } else if (f.type === 'time') {
                const h = String(Math.floor(Math.random() * 9) + 8).padStart(2, '0');
                const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
                val = `${h}:${m}`;
                if (f.id === 'checkOut') val = '17:00';
            } else if (f.type === 'date') {
                // Random date within last year
                const daysAgo = Math.floor(Math.random() * 365);
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);
                val = date.toISOString().split('T')[0];
            } else if (f.type === 'text') {
                // Realistic data based on field purpose
                if (f.id.toLowerCase().includes('name') || f.id.includes('tech') ||
                    f.id.includes('contact') || f.id.includes('passenger') ||
                    f.id.includes('guest') || f.id.includes('buyer') || f.id.includes('owner') ||
                    f.id.includes('requester') || f.id.includes('author') || f.id.includes('designer')) {
                    val = realisticNames[Math.floor(Math.random() * realisticNames.length)];
                } else if (f.id.includes('venue') || f.id.includes('address') ||
                    f.id.includes('location') || f.id.includes('hall')) {
                    val = ['Cairo Main Center', 'Giza Plaza', 'Alexandria Corniche', 'Smart Village Hub', 'Downtown Business District'][Math.floor(Math.random() * 5)];
                } else if (f.id.includes('title') || f.id.includes('subject') || f.id.includes('topic')) {
                    val = ['Q4 Strategy Review', 'Client Meeting', 'Annual Report 2025', 'System Upgrade', 'Team Building Event'][Math.floor(Math.random() * 5)];
                } else if (f.id.includes('url') || f.id.includes('page')) {
                    val = ['/products', '/services', '/about', '/contact', '/blog/article'][Math.floor(Math.random() * 5)];
                } else {
                    val = `Data Entry ${Math.floor(Math.random() * 1000)}`;
                }
            } else if (f.id === 'phone') {
                val = '01' + String(Math.floor(Math.random() * 1000000000)).padStart(9, '0');
            } else if (f.id === 'email') {
                const domains = ['example.com', 'company.com', 'business.eg', 'mail.com'];
                val = `user${Math.floor(Math.random() * 10000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
            }

            // Set value and trigger onChange if field has one
            if (f.onChange) {
                if (el && !f.readonly) {
                    el.value = val;
                    this.handleFieldChange(f.id);
                    // Increased wait time for dependent fields to populate
                    await new Promise(r => setTimeout(r, 150));
                }
            } else {
                if (el && !f.readonly) el.value = val;
            }

            // Visual feedback
            if (el) {
                el.classList.add('auto-filled');
                setTimeout(() => el.classList.remove('auto-filled'), 1000);
            }
        };

        // Process independent fields first (these may trigger dependent fields)
        for (const f of independentFields) await processField(f);

        // Then process dependent fields (country, productName)
        for (const f of dependentFields) await processField(f);
    },

    generateBulk: async function (count) {
        const progressBar = document.getElementById('progressBar');
        const progress = document.getElementById('progress');
        const progressText = document.getElementById('progressText');

        progressBar.style.display = 'block';
        progressText.style.display = 'block';
        progress.style.width = '0%';

        const batchSize = 100;
        let added = 0;

        // Realistic names for bulk generation
        const names = [
            'Ahmed Mohamed Ali', 'Mohamed Hassan Ibrahim', 'Fatma Ahmed Mahmoud', 'Sara Ali Hassan',
            'John Michael Smith', 'Sarah Elizabeth Johnson', 'Michael James Brown', 'Emily Rose Davis',
            'Hassan Kamel Fahmy', 'Laila Youssef Nabil', 'Omar Khaled Sayed', 'Mona Sherif Ahmed',
            'Ali Hassan Sayed', 'Nour Mohamed Kamel', 'Youssef Ahmed Ali', 'Mariam Khaled Hassan'
        ];

        for (let i = 0; i < count; i++) {
            const record = {};

            // FIRST PASS: Generate all simple fields
            this.currentSchema.fields.forEach(f => {
                let val = '';

                // Handle select fields with options
                if (f.options && f.options.length > 0) {
                    val = f.options[Math.floor(Math.random() * f.options.length)];
                }
                // Handle number fields (non-readonly)
                else if ((f.type === 'number' || f.type === 'money' || f.type === 'percent') && !f.readonly) {
                    val = Math.floor(Math.random() * 500) + 10;
                }
                // Handle date fields - IMPROVED: Better time distribution
                else if (f.type === 'date') {
                    // Distribute data across last 12 months with realistic patterns
                    const daysAgo = Math.floor((i / count) * 365); // Spread across year
                    const orderDate = new Date();
                    orderDate.setDate(orderDate.getDate() - (365 - daysAgo));
                    val = orderDate.toISOString().split('T')[0];

                    // Store for later seasonality calculations
                    record['_orderDate'] = orderDate;
                }
                // Handle time fields
                else if (f.type === 'time') {
                    val = `${String(Math.floor(Math.random() * 9) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
                }
                // Handle text names
                else if (f.id.includes('Name') || f.id === 'tech' || f.id === 'contact' ||
                    f.id.includes('requester') || f.id.includes('author')) {
                    val = names[Math.floor(Math.random() * names.length)];
                }
                // Handle phone numbers
                else if (f.id === 'phone') {
                    val = '01' + String(Math.floor(Math.random() * 1000000000)).padStart(9, '0');
                }
                // Handle emails
                else if (f.id === 'email') {
                    const domains = ['example.com', 'company.com', 'business.eg', 'mail.com'];
                    val = `user${Math.floor(Math.random() * 10000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
                }

                // Auto-generate IDs
                if (f.readonly && f.id.toLowerCase().includes('id')) {
                    const prefix = f.id.substring(0, 3).toUpperCase();
                    val = `${prefix}-${2025}-${String(this.orderCounter + i).padStart(5, '0')}`;
                }

                record[f.id] = val;
            });

            // SECOND PASS: Handle dependent fields (country, productName)
            if (record['region'] && this.currentSchema.config && this.currentSchema.config.countriesByRegion) {
                const countries = this.currentSchema.config.countriesByRegion[record['region']];
                if (countries && countries.length > 0) {
                    record['country'] = countries[Math.floor(Math.random() * countries.length)];
                }
            }

            if (record['productCategory'] && this.currentSchema.config && this.currentSchema.config.productsByCategory) {
                const products = this.currentSchema.config.productsByCategory[record['productCategory']];
                if (products && products.length > 0) {
                    record['productName'] = products[Math.floor(Math.random() * products.length)];
                }
            }

            // THIRD PASS: Schema-Specific Calculations with REALISTIC PATTERNS
            if (this.currentSchema.id === 'sales') {
                // Get order date for seasonality calculations
                const orderDate = record['_orderDate'] || new Date();
                const month = orderDate.getMonth(); // 0-11

                // SEASONALITY FACTOR (Realistic market patterns)
                const seasonalBoost = {
                    7: 1.15,  // August - Back to School (+15%)
                    8: 1.25,  // September - Fall Season (+25%)
                    10: 1.45, // November - Black Friday (+45%)
                    11: 1.70  // December - Holiday Season (+70%)
                };
                const seasonalityFactor = seasonalBoost[month] || 1.0;

                // GROWTH TREND (3% monthly growth)
                const monthsFromStart = Math.floor((365 - (new Date() - orderDate) / (24 * 60 * 60 * 1000)) / 30);
                const growthFactor = 1 + (monthsFromStart * 0.03);

                // Realistic quantities based on product category + seasonality
                const category = record['productCategory'];
                let baseQuantity;
                if (category === 'Electronics') {
                    baseQuantity = Math.floor(Math.random() * 8) + 1; // 1-8
                } else if (category === 'Furniture') {
                    baseQuantity = Math.floor(Math.random() * 4) + 1; // 1-4
                } else if (category === 'Office Supplies') {
                    baseQuantity = Math.floor(Math.random() * 150) + 20; // 20-170
                } else if (category === 'Clothing') {
                    baseQuantity = Math.floor(Math.random() * 30) + 5; // 5-35
                } else {
                    baseQuantity = Math.floor(Math.random() * 40) + 5; // 5-45
                }

                // Apply seasonality to quantity
                const quantity = Math.floor(baseQuantity * seasonalityFactor);
                record['quantity'] = quantity;

                // Realistic prices with MARKET VARIATIONS (±15%)
                const product = record['productName'];
                let basePrice;

                // High-end Electronics
                if (product && product.includes('Laptop - Dell XPS')) basePrice = 1800;
                else if (product && product.includes('Laptop - HP Spectre')) basePrice = 1600;
                else if (product && product.includes('Laptop - Lenovo')) basePrice = 1200;
                else if (product && product.includes('Laptop - MacBook')) basePrice = 2400;
                else if (product && product.includes('Desktop - iMac')) basePrice = 2200;
                else if (product && product.includes('Desktop - HP')) basePrice = 900;
                else if (product && product.includes('Tablet - iPad')) basePrice = 850;
                else if (product && product.includes('Tablet - Samsung')) basePrice = 650;
                else if (product && product.includes('Smartphone -iPhone')) basePrice = 1100;
                else if (product && product.includes('Smartphone - Samsung')) basePrice = 950;
                else if (product && product.includes('Monitor')) basePrice = 400;
                else if (product && product.includes('Keyboard')) basePrice = 120;
                else if (product && product.includes('Mouse')) basePrice = 70;
                else if (product && product.includes('Headphones')) basePrice = 350;
                else if (product && product.includes('Printer')) basePrice = 280;

                // Furniture
                else if (product && product.includes('Chair - Herman Miller')) basePrice = 1400;
                else if (product && product.includes('Chair - Ergonomic')) basePrice = 450;
                else if (product && product.includes('Desk - Standing')) basePrice = 800;
                else if (product && product.includes('Desk - Executive')) basePrice = 1200;
                else if (product && product.includes('Desk - L-Shaped')) basePrice = 650;
                else if (product && product.includes('Sofa')) basePrice = 1800;
                else if (product && product.includes('Conference Table')) basePrice = 2500;
                else if (product && product.includes('Bookshelf')) basePrice = 350;

                // Office Supplies
                else if (product && product.includes('Paper')) basePrice = 8;
                else if (product && product.includes('Pens')) basePrice = 12;
                else if (product && product.includes('Notebooks')) basePrice = 6;
                else if (product && product.includes('Binders')) basePrice = 15;
                else if (product && product.includes('Calculator')) basePrice = 25;
                else if (product && product.includes('Staplers')) basePrice = 18;

                // Clothing
                else if (product && product.includes('Suit')) basePrice = 450;
                else if (product && product.includes('Shirt')) basePrice = 60;
                else if (product && product.includes('Pants')) basePrice = 80;
                else if (product && product.includes('Shoes')) basePrice = 120;
                else if (product && product.includes('Blazer')) basePrice = 180;

                // Food & Beverages
                else if (product && product.includes('Coffee')) basePrice = 22;
                else if (product && product.includes('Tea')) basePrice = 15;
                else if (product && product.includes('Snacks')) basePrice = 8;
                else if (product && product.includes('Water')) basePrice = 12;
                else if (product && product.includes('Juice')) basePrice = 18;

                // Default fallback
                else basePrice = 100;

                // Apply price variation (±15% market fluctuation)
                const priceVariation = (Math.random() * 0.3) - 0.15; // -15% to +15%
                const unitPrice = Math.floor(basePrice * (1 + priceVariation) * growthFactor);
                record['unitPrice'] = unitPrice;

                // Calculate gross sales
                const grossSales = quantity * unitPrice;
                record['grossSales'] = grossSales.toFixed(2);

                // CUSTOMER-BASED REALISTIC DISCOUNTS
                const segment = record['customerSegment'];
                let discountPercent;
                if (segment === 'Enterprise') {
                    discountPercent = 10 + Math.floor(Math.random() * 11); // 10-20%
                } else if (segment === 'Government') {
                    discountPercent = 15 + Math.floor(Math.random() * 11); // 15-25%
                } else if (segment === 'SMB') {
                    discountPercent = 5 + Math.floor(Math.random() * 6); // 5-10%
                } else if (segment === 'Individual') {
                    discountPercent = Math.floor(Math.random() * 6); // 0-5%
                } else {
                    discountPercent = Math.floor(Math.random() * 11); // 0-10%
                }
                record['discountPercent'] = discountPercent;

                // Calculate discount amount
                const discountAmount = grossSales * (discountPercent / 100);
                record['discountAmount'] = discountAmount.toFixed(2);

                // Calculate net sales
                const netSales = grossSales - discountAmount;
                record['netSales'] = netSales.toFixed(2);

                // Calculate cost of goods (50-75% of net sales)
                const costMargin = 0.5 + Math.random() * 0.25;
                const costOfGoods = netSales * costMargin;
                record['costOfGoods'] = costOfGoods.toFixed(2);

                // Calculate profit
                const profit = netSales - costOfGoods;
                record['profit'] = profit.toFixed(2);

                // Calculate profit margin
                const profitMargin = netSales > 0 ? (profit / netSales) * 100 : 0;
                record['profitMargin'] = profitMargin.toFixed(2);
            }
            else if (this.currentSchema.id === 'attendance') {
                record['checkIn'] = '09:00';
                record['checkOut'] = '17:00';
                record['workingHours'] = 8;
            }
            else if (this.currentSchema.id === 'finance') {
                if (!record['amount']) record['amount'] = Math.floor(Math.random() * 50000);
            }
            else if (this.currentSchema.id === 'inventory') {
                if (record['qtyOnHand'] && record['unitCost']) {
                    record['totalValue'] = (record['qtyOnHand'] * record['unitCost']).toFixed(2);
                }
            }
            else if (this.currentSchema.id === 'employees') {
                if (record['basicSalary']) {
                    const basic = parseFloat(record['basicSalary']);
                    const incentives = parseFloat(record['incentives']) || 0;
                    const deductions = parseFloat(record['deductions']) || 0;
                    record['netSalary'] = (basic + incentives - deductions).toFixed(2);
                }
            }

            this.data.push(record);
            added++;

            // Update progress bar
            if (added % batchSize === 0 || added === count) {
                const percent = Math.round((added / count) * 100);
                progress.style.width = percent + '%';
                progressText.textContent = `${added.toLocaleString()} / ${count.toLocaleString()}`;
                await new Promise(r => setTimeout(r, 0));
            }
        }

        this.orderCounter += count;
        localStorage.setItem(`counter_${this.currentSchema.id}`, this.orderCounter);
        this.saveToStorage();
        this.renderTableBody();
        this.updateStats();

        setTimeout(() => {
            progressBar.style.display = 'none';
            progressText.style.display = 'none';
            this.showToast(`✅ تم إضافة ${count} سجل!`);
        }, 500);
    },

    exportExcel: function () {
        const ws = XLSX.utils.json_to_sheet(this.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `${this.currentSchema.id}_data.xlsx`);
    },

    searchTable: function (q) {
        q = q.toLowerCase();
        const rows = document.querySelectorAll('#tableBody tr');
        rows.forEach(r => {
            r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    },

    generateCustomBulk: function () {
        const input = document.getElementById('customBulkCount');
        const count = parseInt(input.value);
        if (count > 0) {
            this.generateBulk(count);
        } else {
            this.showToast('❌ يرجى إدخال رقم صحيح');
        }
    },

    // CRITICAL FIX: Explicit save function
    saveToStorage: function () {
        if (!this.currentSchema) return;
        const key = `data_${this.currentSchema.id}`;

        // Clean data before saving (remove currency symbols if any)
        const cleanData = this.data.map(r => {
            const newR = { ...r };
            // Ensure numbers are numbers
            if (newR.netSales) newR.netSales = this.parseNumber(newR.netSales);
            if (newR.profit) newR.profit = this.parseNumber(newR.profit);
            return newR;
        });

        localStorage.setItem(key, JSON.stringify(cleanData));
        // Also save to legacy key just in case
        if (this.currentSchema.id === 'sales') {
            localStorage.setItem('salesData', JSON.stringify(cleanData));
        }
        console.log(`Saved ${cleanData.length} records to ${key}`);
    },

    parseNumber: function (val) {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
    }
};

// Handlers for Custom Select
window.toggleSelect = function () {
    document.querySelector('.custom-select').classList.toggle('open');
}

window.selectOption = function (val) {
    engine.init(val);
}

// Close select if clicked outside
window.addEventListener('click', function (e) {
    const select = document.querySelector('.custom-select');
    if (select && !select.contains(e.target)) {
        select.classList.remove('open');
    }
});

// Start App
document.addEventListener('DOMContentLoaded', () => {
    // Migrate old data if exists to new key
    const oldData = localStorage.getItem('salesData');
    if (oldData && !localStorage.getItem('data_sales')) {
        localStorage.setItem('data_sales', oldData);
    }

    engine.init('sales');
});
