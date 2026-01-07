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

    showToast: function (msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    },

    // --- GENERATORS ---
    autoFill: async function () {
        // Iterate twice: 
        // 1. Independent fields (trigger dependencies)
        // 2. Dependent fields (now populated)

        const independentFields = this.currentSchema.fields.filter(f => !['country', 'productName'].includes(f.id));
        const dependentFields = this.currentSchema.fields.filter(f => ['country', 'productName'].includes(f.id));

        const processField = async (f) => {
            const el = document.getElementById(f.id);
            if (!el || (f.readonly && !f.id.includes('total') && !f.id.includes('Sales') && !f.id.includes('Salary') && f.id !== 'workingHours')) return;

            let val = '';

            // Check DOM options if schema options empty (for dependent fields)
            let opts = f.options;

            // For Select fields, ALWAYS prefer DOM options as they might have been updated (init or onChange)
            if (el.tagName === 'SELECT') {
                const domOpts = Array.from(el.options).filter(o => o.value !== "").map(o => o.value);
                if (domOpts.length > 0) opts = domOpts;
            }

            if (opts && opts.length > 0) {
                // Handle mixed types (numbers in options vs string values in DOM)
                val = opts[Math.floor(Math.random() * opts.length)];
            } else if (f.type === 'number' || f.type === 'money' || f.type === 'percent') {
                val = Math.floor(Math.random() * 100) + 1;
            } else if (f.type === 'time') {
                const h = String(Math.floor(Math.random() * 9) + 8).padStart(2, '0');
                const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
                val = `${h}:${m}`;
                if (f.id === 'checkOut') val = '17:00';
            } else if (f.type === 'date') {
                val = new Date().toISOString().split('T')[0];
            } else if (f.type === 'text') {
                if (f.id.toLowerCase().includes('name') || f.id.includes('tech') || f.id.includes('contact') || f.id.includes('passenger') || f.id.includes('guest') || f.id.includes('buyer') || f.id.includes('owner')) {
                    val = ['Ahmed Ali', 'Mohamed Salem', 'Sarah Jones', 'Lina Smith', 'Hassan Kamel'][Math.floor(Math.random() * 5)];
                } else if (f.id.includes('venue') || f.id.includes('address') || f.id.includes('location') || f.id.includes('hall')) {
                    val = ['Cairo Main Center', 'Giza Plaza', 'Alex Corniche', 'Downtown Mall', 'Smart Village'][Math.floor(Math.random() * 5)];
                } else if (f.id.includes('title') || f.id.includes('subject')) {
                    val = ['New Project Launch', 'Monthly Meeting', 'Annual Review', 'Urgent Fix'][Math.floor(Math.random() * 4)];
                } else {
                    val = `Sample ${f.label} ${Math.floor(Math.random() * 100)}`;
                }
            } else if (f.id === 'phone') {
                val = '01' + Math.floor(Math.random() * 100000000);
            } else if (f.id === 'email') {
                val = `user${Math.floor(Math.random() * 1000)}@example.com`;
            }

            if (f.onChange) {
                if (el) {
                    el.value = val;
                    this.handleFieldChange(f.id);
                    // Wait for handler to populate dependents
                    await new Promise(r => setTimeout(r, 100));
                }
            } else {
                if (el) el.value = val;
            }

            if (el) {
                el.classList.add('auto-filled');
                setTimeout(() => el.classList.remove('auto-filled'), 1000);
            }
        };

        for (const f of independentFields) await processField(f);
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

        // Create a virtual form context to reuse handlers
        const virtualForm = {};

        for (let i = 0; i < count; i++) {
            const record = {};

            // Generate basic fields
            this.currentSchema.fields.forEach(f => {
                let val = '';
                if (f.options) {
                    val = f.options[Math.floor(Math.random() * f.options.length)];
                } else if (f.type === 'number') {
                    val = Math.floor(Math.random() * 500) + 10;
                } else if (f.type === 'date') {
                    val = new Date(2023, 0, 1 + Math.floor(Math.random() * 365)).toISOString().split('T')[0];
                } else if (f.type === 'time') {
                    val = `${String(Math.floor(Math.random() * 9) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
                } else if (f.id.includes('Name') || f.id === 'tech' || f.id === 'contact') {
                    val = ['Ahmed', 'Mohamed', 'Sarah', 'Lina'][Math.floor(Math.random() * 4)] + ' ' + ['Ali', 'Hassan', 'Smith', 'Jones'][Math.floor(Math.random() * 4)];
                } else if (f.id === 'phone') {
                    val = '01' + Math.floor(Math.random() * 100000000);
                } else if (f.id === 'email') {
                    val = `user${Math.floor(Math.random() * 1000)}@mail.com`;
                }

                // Auto-IDs (Generic)
                if (f.readonly && f.id.toLowerCase().includes('id')) {
                    const prefix = f.id.substring(0, 3).toUpperCase();
                    val = `${prefix}-${2025}-${String(this.orderCounter + i).padStart(5, '0')}`;
                }

                record[f.id] = val;
            });

            // Schema-Specific Logic (Simplified for Bulk)
            if (this.currentSchema.id === 'sales') {
                const q = record['quantity'] = Math.floor(Math.random() * 20) + 1;
                const p = record['unitPrice'] = Math.floor(Math.random() * 1000) + 50;
                const d = record['discountPercent'] = 0;
                record['grossSales'] = (q * p).toFixed(2);
                record['netSales'] = (q * p).toFixed(2);
                record['profit'] = (q * p * 0.2).toFixed(2);
                record['discountAmount'] = "0.00";
                record['profitMargin'] = "20.00";
            }
            else if (this.currentSchema.id === 'attendance') {
                record['checkIn'] = '09:00'; record['checkOut'] = '17:00'; record['workingHours'] = 8;
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
                    record['netSalary'] = record['basicSalary'];
                }
            }


            this.data.push(record);
            added++;

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
