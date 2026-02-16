// ========== USER DATABASE WITH PERMANENT STORAGE ==========
// Load users from localStorage or use defaults
function loadUsers() {
    const savedUsers = localStorage.getItem('bankUsers');
    if (savedUsers) {
        return JSON.parse(savedUsers);
    } else {
        // Default users with account balances
        const defaultUsers = [
            { 
                username: 'john', 
                password: 'demo123', 
                fullName: 'John', 
                email: 'john@example.com', 
                accountType: 'Chase Total Checking®',
                checkingBalance: 3450.87,
                savingsBalance: 8999.45,
                creditBalance: 450.22,
                creditLimit: 5000,
                checkingAccount: '4321',
                savingsAccount: '9876',
                creditAccount: '1234'
            },
            { 
                username: 'james', 
                password: 'demo123', 
                fullName: 'James', 
                email: 'james@example.com', 
                accountType: 'Chase Savings℠',
                checkingBalance: 2100.50,
                savingsBalance: 12500.75,
                creditBalance: 120.45,
                creditLimit: 3000,
                checkingAccount: '4322',
                savingsAccount: '9877',
                creditAccount: '1235'
            },
            { 
                username: 'sarah', 
                password: 'demo123', 
                fullName: 'Sarah', 
                email: 'sarah@example.com', 
                accountType: 'Chase Freedom Unlimited®',
                checkingBalance: 5200.30,
                savingsBalance: 15750.90,
                creditBalance: 780.60,
                creditLimit: 8000,
                checkingAccount: '4323',
                savingsAccount: '9878',
                creditAccount: '1236'
            },
            { 
                username: 'david', 
                password: '12345', 
                fullName: 'David', 
                email: 'david@example.com', 
                accountType: 'Chase Total Checking®',
                checkingBalance: 1890.25,
                savingsBalance: 3400.00,
                creditBalance: 230.15,
                creditLimit: 4000,
                checkingAccount: '4324',
                savingsAccount: '9879',
                creditAccount: '1237'
            }
        ];
        localStorage.setItem('bankUsers', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('bankUsers', JSON.stringify(users));
}

// Initialize users
let users = loadUsers();
let currentUser = null;
let currentSlide = 0;
let slideInterval;

// ========== LOADING OVERLAY ==========
function showLoading(message = 'Processing...') {
    hideLoading();
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
        transition: opacity 0.3s;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 60px;
        height: 60px;
        border: 4px solid #E6F0FA;
        border-top: 4px solid #0B5394;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
    `;
    
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        font-size: 1.2rem;
        color: #0B5394;
        font-weight: 500;
        animation: pulse 1.5s ease-in-out infinite;
    `;
    messageEl.textContent = message;
    
    const subMessageEl = document.createElement('div');
    subMessageEl.style.cssText = `
        font-size: 0.9rem;
        color: #4A5568;
        margin-top: 10px;
    `;
    subMessageEl.textContent = 'Please wait...';
    
    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(messageEl);
    loadingOverlay.appendChild(subMessageEl);
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    const existingOverlay = document.getElementById('loadingOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
}

// ========== FORMAT CURRENCY ==========
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// ========== UPDATE DASHBOARD BALANCES - FIXED FOR YOUR HTML ==========
function updateDashboardBalances() {
    if (!currentUser) return;
    
    console.log('Updating balances for:', currentUser.fullName);
    
    // Update Total Balance in summary card
    const totalBalanceElements = document.querySelectorAll('.summary-card .card-value');
    totalBalanceElements.forEach(el => {
        const parentCard = el.closest('.summary-card');
        if (parentCard && parentCard.querySelector('.card-label')?.textContent.includes('Total Balance')) {
            const total = currentUser.checkingBalance + currentUser.savingsBalance;
            el.textContent = formatCurrency(total);
            
            // Update checking and savings details
            const detailsEl = parentCard.querySelector('.card-details');
            if (detailsEl) {
                const spans = detailsEl.querySelectorAll('span');
                if (spans.length >= 2) {
                    spans[0].textContent = `Checking: ${formatCurrency(currentUser.checkingBalance)}`;
                    spans[1].textContent = `Savings: ${formatCurrency(currentUser.savingsBalance)}`;
                }
            }
        }
    });
    
    // Update Credit Card Balance
    const creditCardElements = document.querySelectorAll('.summary-card .card-value');
    creditCardElements.forEach(el => {
        const parentCard = el.closest('.summary-card');
        if (parentCard && parentCard.querySelector('.card-label')?.textContent.includes('Credit Card Balance')) {
            el.textContent = formatCurrency(currentUser.creditBalance);
        }
    });
    
    // Update Account Cards
    const accountCards = document.querySelectorAll('.account-card');
    accountCards.forEach(card => {
        const accountType = card.querySelector('.account-type span')?.textContent;
        const balanceEl = card.querySelector('.account-balance');
        
        if (accountType && balanceEl) {
            if (accountType.includes('Everyday Checking')) {
                balanceEl.textContent = formatCurrency(currentUser.checkingBalance);
                
                // Update account number
                const accountNumEl = card.querySelector('.account-number');
                if (accountNumEl) {
                    accountNumEl.textContent = `···· ${currentUser.checkingAccount}`;
                }
            }
            else if (accountType.includes('Savings')) {
                balanceEl.textContent = formatCurrency(currentUser.savingsBalance);
                
                // Update account number
                const accountNumEl = card.querySelector('.account-number');
                if (accountNumEl) {
                    accountNumEl.textContent = `···· ${currentUser.savingsAccount}`;
                }
            }
            else if (accountType.includes('Freedom Credit Card')) {
                balanceEl.textContent = formatCurrency(currentUser.creditBalance);
                
                // Update credit details
                const creditDetails = card.querySelector('.credit-details');
                if (creditDetails) {
                    const spans = creditDetails.querySelectorAll('span');
                    if (spans.length >= 2) {
                        const available = currentUser.creditLimit - currentUser.creditBalance;
                        spans[0].textContent = `Available: ${formatCurrency(available)}`;
                        spans[1].textContent = `Credit limit: ${formatCurrency(currentUser.creditLimit)}`;
                    }
                }
                
                // Update account number
                const accountNumEl = card.querySelector('.account-number');
                if (accountNumEl) {
                    accountNumEl.textContent = `···· ${currentUser.creditAccount}`;
                }
            }
        }
    });
    
    // Update any other balance displays
    const creditBalanceElements = document.querySelectorAll('.rewards-value, .rewards-earned');
    creditBalanceElements.forEach(el => {
        if (el.textContent.includes('$')) {
            // Update if needed
        }
    });
    
    console.log('Balances updated successfully');
}

// ========== FEATURE MODAL ==========
function showFeatureModal(title, content, action = null) {
    const existingModal = document.getElementById('featureModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'featureModal';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.style.cssText = `
        background: white;
        border-radius: 20px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    const modalHeader = document.createElement('div');
    modalHeader.style.cssText = `
        background: linear-gradient(135deg, #0B5394, #062E4F);
        color: white;
        padding: 20px 24px;
        border-radius: 20px 20px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const modalTitle = document.createElement('h2');
    modalTitle.style.cssText = `
        font-size: 1.3rem;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    modalTitle.innerHTML = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    closeBtn.onclick = () => modalOverlay.remove();
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    const modalBody = document.createElement('div');
    modalBody.style.cssText = `padding: 24px;`;
    modalBody.innerHTML = content;
    
    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalBody);
    
    if (action) {
        const modalFooter = document.createElement('div');
        modalFooter.style.cssText = `
            padding: 20px 24px;
            border-top: 1px solid #E5E5E5;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            background: none;
            border: 1px solid #CBD5E0;
            color: #4A5568;
            padding: 10px 24px;
            border-radius: 40px;
            font-weight: 500;
            cursor: pointer;
        `;
        cancelBtn.onclick = () => modalOverlay.remove();
        
        const actionBtn = document.createElement('button');
        actionBtn.textContent = action.text;
        actionBtn.style.cssText = `
            background: #0B5394;
            border: none;
            color: white;
            padding: 10px 24px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
        `;
        actionBtn.onclick = () => {
            modalOverlay.remove();
            if (action.handler) {
                action.handler();
            } else {
                showLoading('Processing...');
                setTimeout(() => {
                    hideLoading();
                    alert(action.message || 'Action completed successfully!');
                }, 1500);
            }
        };
        
        modalFooter.appendChild(cancelBtn);
        modalFooter.appendChild(actionBtn);
        modalContainer.appendChild(modalFooter);
    }
    
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);
    
    modalOverlay.onclick = function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    };
}

// ========== TRANSFER MONEY FEATURE ==========
function showTransfer() {
    if (!currentUser) {
        alert('Please login first');
        showLoginModal();
        return;
    }
    
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="background: #F0F5FE; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="color: #0B5394; margin-bottom: 10px;">Current Balances</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Checking (····${currentUser.checkingAccount})</span>
                    <span style="font-weight: 600; color: #0A2540;">${formatCurrency(currentUser.checkingBalance)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Savings (····${currentUser.savingsAccount})</span>
                    <span style="font-weight: 600; color: #0A2540;">${formatCurrency(currentUser.savingsBalance)}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">Transfer FROM</label>
                <select id="fromAccount" style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                    <option value="checking">Checking Account - ${formatCurrency(currentUser.checkingBalance)}</option>
                    <option value="savings">Savings Account - ${formatCurrency(currentUser.savingsBalance)}</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">Transfer TO</label>
                <select id="toAccount" style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                    <option value="savings">Savings Account</option>
                    <option value="checking">Checking Account</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">Amount</label>
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 1.2rem; margin-right: 8px;">$</span>
                    <input type="number" id="transferAmount" min="0.01" step="0.01" placeholder="0.00" style="flex: 1; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">Description (optional)</label>
                <input type="text" id="transferDesc" placeholder="e.g., Moving money to savings" style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
            </div>
            
            <div style="background: #FFF3E0; padding: 10px; border-radius: 8px; font-size: 0.9rem; color: #B85C00;">
                <i class="fas fa-info-circle"></i> Transfers are processed immediately and balances will update.
            </div>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-exchange-alt"></i> Transfer Money',
        content,
        { 
            text: 'Complete Transfer', 
            handler: processTransfer
        }
    );
}

// ========== PROCESS TRANSFER ==========
function processTransfer() {
    const fromAccount = document.getElementById('fromAccount')?.value;
    const toAccount = document.getElementById('toAccount')?.value;
    const amount = parseFloat(document.getElementById('transferAmount')?.value);
    const description = document.getElementById('transferDesc')?.value || 'Account transfer';
    
    // Validation
    if (!fromAccount || !toAccount) {
        alert('Please select both accounts');
        return;
    }
    
    if (fromAccount === toAccount) {
        alert('FROM and TO accounts must be different');
        return;
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than 0');
        return;
    }
    
    // Check sufficient funds
    const fromBalance = fromAccount === 'checking' ? currentUser.checkingBalance : currentUser.savingsBalance;
    
    if (amount > fromBalance) {
        alert(`Insufficient funds. Your ${fromAccount} account balance is ${formatCurrency(fromBalance)}`);
        return;
    }
    
    showLoading('Processing transfer...');
    
    setTimeout(() => {
        // Process the transfer
        if (fromAccount === 'checking' && toAccount === 'savings') {
            currentUser.checkingBalance -= amount;
            currentUser.savingsBalance += amount;
        } else if (fromAccount === 'savings' && toAccount === 'checking') {
            currentUser.savingsBalance -= amount;
            currentUser.checkingBalance += amount;
        }
        
        // Find and update user in users array
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            saveUsers(users);
        }
        
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update dashboard balances immediately
        updateDashboardBalances();
        
        hideLoading();
        
        // Show success message
        alert(`✅ Transfer Successful!\n\n` +
              `Amount: ${formatCurrency(amount)}\n` +
              `From: ${fromAccount === 'checking' ? 'Checking' : 'Savings'}\n` +
              `To: ${toAccount === 'checking' ? 'Checking' : 'Savings'}\n\n` +
              `New Balances:\n` +
              `Checking: ${formatCurrency(currentUser.checkingBalance)}\n` +
              `Savings: ${formatCurrency(currentUser.savingsBalance)}`);
        
    }, 1500);
}

// ========== SEND MONEY FEATURE ==========
function showSendMoney() {
    if (!currentUser) {
        alert('Please login first');
        showLoginModal();
        return;
    }
    
    const content = `
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">Select recipient</label>
            <select style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px; margin-bottom: 15px;">
                <option>John Doe (john@email.com)</option>
                <option>Sarah Smith (sarah@email.com)</option>
                <option>Michael Chen (michael@email.com)</option>
            </select>
            
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">Amount</label>
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 1.2rem; margin-right: 8px;">$</span>
                <input type="number" placeholder="0.00" style="flex: 1; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
            </div>
            
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">From account</label>
            <select style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                <option>Checking (····${currentUser.checkingAccount}) - ${formatCurrency(currentUser.checkingBalance)}</option>
                <option>Savings (····${currentUser.savingsAccount}) - ${formatCurrency(currentUser.savingsBalance)}</option>
            </select>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-paper-plane"></i> Send Money',
        content,
        { text: 'Send Payment', message: 'Payment sent successfully!' }
    );
}

// ========== PAY BILLS FEATURE ==========
function showPayBills() {
    if (!currentUser) {
        alert('Please login first');
        showLoginModal();
        return;
    }
    
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="background: #F0F5FE; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="color: #0B5394; margin-bottom: 10px;">Upcoming Bills</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Chase Freedom Card</span>
                    <span style="font-weight: 600;">${formatCurrency(currentUser.creditBalance)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Electric Bill</span>
                    <span style="font-weight: 600;">$85.40</span>
                </div>
            </div>
            
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">Select payee</label>
            <select style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px; margin-bottom: 15px;">
                <option>Chase Freedom Card</option>
                <option>Electric Company</option>
                <option>Internet Provider</option>
            </select>
            
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">Amount</label>
            <input type="number" placeholder="Enter amount" style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px; margin-bottom: 15px;">
            
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748;">From account</label>
            <select style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                <option>Checking (····${currentUser.checkingAccount}) - ${formatCurrency(currentUser.checkingBalance)}</option>
                <option>Savings (····${currentUser.savingsAccount}) - ${formatCurrency(currentUser.savingsBalance)}</option>
            </select>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-file-invoice"></i> Pay Bills',
        content,
        { text: 'Schedule Payment', message: 'Payment scheduled successfully!' }
    );
}

// ========== DEPOSIT CHECK FEATURE ==========
function showDepositCheck() {
    if (!currentUser) {
        alert('Please login first');
        showLoginModal();
        return;
    }
    
    const content = `
        <div style="margin-bottom: 20px; text-align: center;">
            <div style="background: #F0F5FE; padding: 30px; border-radius: 12px; margin-bottom: 20px; border: 2px dashed #0B5394;">
                <i class="fas fa-camera" style="font-size: 3rem; color: #0B5394; margin-bottom: 10px;"></i>
                <h4 style="color: #0B5394;">Take a photo of your check</h4>
            </div>
            
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2D3748; text-align: left;">Deposit to</label>
            <select style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                <option>Checking (····${currentUser.checkingAccount})</option>
                <option>Savings (····${currentUser.savingsAccount})</option>
            </select>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-camera"></i> Deposit Check',
        content,
        { text: 'Deposit Check', message: 'Check deposit submitted! Funds will be available in 1-2 business days.' }
    );
}

// ========== CREDIT CARD DETAILS ==========
function showCreditCard() {
    if (!currentUser) {
        alert('Please login first');
        showLoginModal();
        return;
    }
    
    const available = currentUser.creditLimit - currentUser.creditBalance;
    
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #0B5394, #062E4F); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <span>Chase Freedom Unlimited®</span>
                    <span><i class="fab fa-cc-visa"></i></span>
                </div>
                <div style="font-size: 1.3rem; margin-bottom: 15px;">···· ···· ···· ${currentUser.creditAccount}</div>
                <div>${currentUser.fullName}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: #F0F5FE; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.9rem; color: #6B7A8D;">Current Balance</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${formatCurrency(currentUser.creditBalance)}</div>
                </div>
                <div style="background: #F0F5FE; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.9rem; color: #6B7A8D;">Available Credit</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${formatCurrency(available)}</div>
                </div>
            </div>
            
            <div style="background: #F0F5FE; padding: 15px; border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Credit Limit</span>
                    <span style="font-weight: 600;">${formatCurrency(currentUser.creditLimit)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Cash Back Earned</span>
                    <span style="font-weight: 600; color: #0B5394;">$23.45</span>
                </div>
            </div>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-credit-card"></i> Credit Card Details',
        content
    );
}

// ========== INVESTMENTS FEATURE ==========
function showInvestments() {
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="background: #F0F5FE; padding: 20px; border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="font-weight: 600;">Portfolio Value</span>
                    <span style="font-size: 1.5rem; font-weight: 700;">$25,430.50</span>
                </div>
                <div><i class="fas fa-arrow-up" style="color: #2C9A4C;"></i> +3.2% today</div>
            </div>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-chart-line"></i> Investments',
        content
    );
}

// ========== FINANCIAL GOALS FEATURE ==========
function showFinancialGoals() {
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="background: #F0F5FE; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-umbrella-beach" style="font-size: 2rem; color: #0B5394;"></i>
                    <div style="flex: 1;">
                        <h4>Vacation Fund</h4>
                        <div style="height: 8px; background: #E0E8F5; border-radius: 4px;">
                            <div style="width: 40%; height: 100%; background: #0B5394;"></div>
                        </div>
                        <div>$1,200 of $3,000 (40%)</div>
                    </div>
                </div>
            </div>
            <div style="background: #F0F5FE; padding: 20px; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-car" style="font-size: 2rem; color: #0B5394;"></i>
                    <div style="flex: 1;">
                        <h4>New Car</h4>
                        <div style="height: 8px; background: #E0E8F5; border-radius: 4px;">
                            <div style="width: 33%; height: 100%; background: #0B5394;"></div>
                        </div>
                        <div>$5,000 of $15,000 (33%)</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-bullseye"></i> Financial Goals',
        content
    );
}

// ========== REWARDS FEATURE ==========
function showRewards() {
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #0B5394, #062E4F); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2.5rem; font-weight: 700;">2,450</div>
                <div>Rewards Points</div>
                <div style="margin-top: 10px;">≈ $24.50 value</div>
            </div>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-gem"></i> Rewards',
        content
    );
}

// ========== MORTGAGE CALCULATOR ==========
function calculateMortgage() {
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="background: #F0F5FE; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-weight: 600;">Monthly Payment</span>
                    <span style="font-size: 1.5rem; font-weight: 700; color: #0B5394;">$1,656</span>
                </div>
            </div>
            
            <label style="display: block; margin-bottom: 8px;">Loan Amount</label>
            <input type="number" value="300000" style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px; margin-bottom: 15px;">
            
            <label style="display: block; margin-bottom: 8px;">Interest Rate (%)</label>
            <input type="number" value="5.25" style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px; margin-bottom: 15px;">
            
            <label style="display: block; margin-bottom: 8px;">Loan Term</label>
            <select style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                <option>15 years</option>
                <option selected>30 years</option>
            </select>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-calculator"></i> Mortgage Calculator',
        content,
        { text: 'Calculate', message: 'Based on your inputs, your estimated monthly payment is $1,656' }
    );
}

// ========== BUDGET PLANNER ==========
function openBudgetPlanner() {
    const content = `
        <div style="margin-bottom: 20px;">
            <h4>Monthly Budget Summary</h4>
            <div style="background: #F0F5FE; padding: 15px; border-radius: 12px; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Income</span>
                    <span style="font-weight: 600;">$5,200</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Expenses</span>
                    <span style="font-weight: 600;">$4,200</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #E5E5E5;">
                    <span style="font-weight: 600;">Remaining</span>
                    <span style="font-weight: 700; color: #2C9A4C;">$1,000</span>
                </div>
            </div>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-chart-pie"></i> Budget Planner',
        content
    );
}

// ========== CREDIT SCORE ==========
function checkCreditScore() {
    const content = `
        <div style="margin-bottom: 20px; text-align: center;">
            <div style="background: linear-gradient(135deg, #0B5394, #062E4F); color: white; padding: 30px; border-radius: 12px;">
                <div style="font-size: 3rem; font-weight: 700;">785</div>
                <div style="font-size: 1.2rem;">Excellent</div>
                <div style="margin-top: 10px;"><i class="fas fa-arrow-up"></i> +15 from last month</div>
            </div>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-credit-card"></i> Credit Score',
        content
    );
}

// ========== BRANCH LOCATOR ==========
function findBranch() {
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="background: #F0F5FE; padding: 20px; border-radius: 12px;">
                <div style="display: flex; gap: 10px;">
                    <input type="text" placeholder="Enter ZIP code" style="flex: 1; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                    <button style="background: #0B5394; color: white; border: none; padding: 12px 20px; border-radius: 8px;">Search</button>
                </div>
            </div>
            <div style="border: 1px solid #E5E5E5; border-radius: 12px; padding: 15px; margin-top: 15px;">
                <h5>Chase Bank - Downtown</h5>
                <p style="color: #6B7A8D;">123 Main St, New York, NY</p>
                <p style="color: #2C9A4C;">0.5 miles away · Open until 6PM</p>
            </div>
        </div>
    `;
    
    showFeatureModal(
        '<i class="fas fa-university"></i> Find a Branch',
        content
    );
}

// ========== SLIDER FUNCTIONS ==========
function changeSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentSlide = index;
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    const nextIndex = (currentSlide + 1) % slides.length;
    changeSlide(nextIndex);
}

function startSlider() {
    if (document.querySelectorAll('.slide').length > 0) {
        slideInterval = setInterval(nextSlide, 5000);
    }
}

// ========== PASSWORD TOGGLE FUNCTIONS ==========
function togglePassword() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }
}

function toggleModalPassword() {
    const passwordInput = document.getElementById('modalPassword');
    const toggleIcon = document.getElementById('modalPasswordToggleIcon');
    
    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }
}

function toggleNewPassword() {
    const passwordInput = document.getElementById('newPassword');
    const toggleIcon = document.getElementById('newPasswordToggleIcon');
    
    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }
}

// ========== MODAL FUNCTIONS ==========
function showLoginModal() {
    showLoading('Opening sign in...');
    
    setTimeout(() => {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        hideLoading();
    }, 800);
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showOpenAccount() {
    showLoading('Preparing application...');
    
    setTimeout(() => {
        const modal = document.getElementById('openAccountModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        hideLoading();
    }, 1000);
}

function hideOpenAccount() {
    const modal = document.getElementById('openAccountModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ========== ACCOUNT CREATION ==========
function createAccount(event) {
    if (event) {
        event.preventDefault();
    }
    
    const fullName = document.getElementById('fullName')?.value.trim();
    const username = document.getElementById('newUsername')?.value.trim();
    const password = document.getElementById('newPassword')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const accountType = document.getElementById('accountType')?.value;

    if (!fullName || !username || !password) {
        alert('Please fill in all required fields');
        return false;
    }

    if (users.find(u => u.username === username)) {
        alert('Username already exists. Please choose another.');
        return false;
    }

    showLoading('Creating your account...');

    setTimeout(() => {
        const firstName = fullName.split(' ')[0];
        
        // Generate random account numbers
        const checkingNum = Math.floor(1000 + Math.random() * 9000);
        const savingsNum = Math.floor(1000 + Math.random() * 9000);
        const creditNum = Math.floor(1000 + Math.random() * 9000);

        const newUser = {
            username: username,
            password: password,
            fullName: firstName,
            email: email,
            accountType: accountType || 'Chase Total Checking®',
            checkingBalance: 100.00,
            savingsBalance: 50.00,
            creditBalance: 0.00,
            creditLimit: 1000,
            checkingAccount: checkingNum.toString(),
            savingsAccount: savingsNum.toString(),
            creditAccount: creditNum.toString()
        };

        users.push(newUser);
        saveUsers(users);

        hideLoading();

        alert(`✅ Account Created Successfully!\n\n` +
              `Name: ${fullName}\n` +
              `Username: ${username}\n` +
              `Account Type: ${newUser.accountType}\n\n` +
              `Starting Balances:\n` +
              `Checking: $100.00\n` +
              `Savings: $50.00\n\n` +
              `You can now login with your username and password.`);

        // Clear form
        document.getElementById('fullName').value = '';
        document.getElementById('email').value = '';
        if (document.getElementById('phone')) document.getElementById('phone').value = '';
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
        
        hideOpenAccount();
        
    }, 2500);
    
    return false;
}

// ========== LOGIN FUNCTIONS ==========
function handleLogin(event) {
    if (event) {
        event.preventDefault();
    }
    
    const username = document.getElementById('loginUsername')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();

    if (!username || !password) {
        alert('Please enter both username and password');
        return false;
    }

    showLoading('Verifying credentials...');

    setTimeout(() => {
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            currentUser = user;
            
            showLoading('Loading your dashboard...');
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            setTimeout(() => {
                hideLoading();
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            hideLoading();
            alert('❌ Invalid username or password. Please try again.\n\nDemo users:\njohn/demo123\njames/demo123\nsarah/demo123\ndavid/12345');
        }
    }, 2000);
    
    return false;
}

function handleModalLogin(event) {
    if (event) {
        event.preventDefault();
    }
    
    const username = document.getElementById('modalUsername')?.value.trim();
    const password = document.getElementById('modalPassword')?.value.trim();

    if (!username || !password) {
        alert('Please enter both username and password');
        return false;
    }

    showLoading('Verifying credentials...');

    setTimeout(() => {
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            currentUser = user;
            
            showLoading('Loading your dashboard...');
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            setTimeout(() => {
                hideLoading();
                hideLoginModal();
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            hideLoading();
            alert('❌ Invalid username or password. Please try again.');
        }
    }, 2000);
    
    return false;
}

// ========== DASHBOARD FUNCTIONS ==========
function loadDashboardUser() {
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
        currentUser = JSON.parse(userData);
        
        showLoading('Loading your account information...');
        
        setTimeout(() => {
            // Update user name displays
            const userNameDisplay = document.getElementById('userNameDisplay');
            if (userNameDisplay) userNameDisplay.textContent = currentUser.fullName;
            
            const profileInitial = document.getElementById('dashboardProfileInitial');
            if (profileInitial) profileInitial.textContent = currentUser.fullName.charAt(0).toUpperCase();
            
            const userNameBanner = document.getElementById('userNameBanner');
            if (userNameBanner) userNameBanner.textContent = currentUser.fullName;
            
            // Update all balances
            updateDashboardBalances();
            
            hideLoading();
        }, 1800);
        
    } else {
        window.location.href = 'index.html';
    }
}

function logout() {
    showLoading('Signing out...');
    
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        hideLoading();
        window.location.href = 'index.html';
    }, 1500);
}

// ========== QUICK ACTION FUNCTIONS ==========
function handleQuickAction(action) {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('send') || actionLower.includes('payment')) {
        showSendMoney();
    } else if (actionLower.includes('bill')) {
        showPayBills();
    } else if (actionLower.includes('deposit')) {
        showDepositCheck();
    } else if (actionLower.includes('transfer')) {
        showTransfer();
    } else if (actionLower.includes('credit')) {
        showCreditCard();
    } else if (actionLower.includes('invest')) {
        showInvestments();
    } else if (actionLower.includes('goal')) {
        showFinancialGoals();
    } else if (actionLower.includes('reward')) {
        showRewards();
    } else {
        showLoading(`Processing ${action}...`);
        setTimeout(() => {
            hideLoading();
            showFeatureModal(
                '<i class="fas fa-info-circle"></i> Feature Demo',
                `<p style="margin: 20px 0; text-align: center;">This is a demo of the "${action}" feature.</p>`
            );
        }, 1500);
    }
}

// ========== ADMIN FUNCTIONS ==========
function showAllUsers() {
    let userList = '👥 USERS:\n\n';
    users.forEach((u, i) => {
        userList += `${i+1}. ${u.username} / ${u.password} - ${u.fullName}\n`;
        userList += `   Checking: ${formatCurrency(u.checkingBalance)}\n`;
        userList += `   Savings: ${formatCurrency(u.savingsBalance)}\n\n`;
    });
    alert(userList);
}

function resetToDefaultUsers() {
    if (confirm('⚠️ Warning: This will delete all created accounts. Continue?')) {
        localStorage.removeItem('bankUsers');
        localStorage.removeItem('currentUser');
        alert('Users reset. Page will reload.');
        location.reload();
    }
}

// ========== FILTER TRANSACTIONS ==========
function filterTransactions() {
    showFeatureModal(
        '<i class="fas fa-filter"></i> Filter Transactions',
        `<div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px;">Date Range</label>
            <select style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
            </select>
        </div>`,
        { text: 'Apply Filters', message: 'Filters applied!' }
    );
}

// ========== DOWNLOAD STATEMENT ==========
function downloadStatement() {
    showFeatureModal(
        '<i class="fas fa-download"></i> Download Statement',
        `<div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px;">Select Statement Period</label>
            <select style="width: 100%; padding: 12px; border: 1px solid #CBD5E0; border-radius: 8px;">
                <option>January 2026</option>
                <option>December 2025</option>
                <option>November 2025</option>
            </select>
        </div>`,
        { text: 'Download', message: 'Your statement is being generated.' }
    );
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Check if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardUser();
    }
    
    // Start slider if exists
    if (document.querySelector('.slider-container')) {
        startSlider();
    }
    
    // Add click handlers to all quick action buttons
    document.querySelectorAll('.quick-action-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.querySelector('span')?.textContent || this.textContent.trim();
            handleQuickAction(action);
        });
    });
    
    // Add click handlers to account action buttons
    document.querySelectorAll('.account-action').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const action = this.textContent.trim();
            
            if (action.includes('Transfer')) {
                showTransfer();
            } else if (action.includes('Deposit')) {
                showDepositCheck();
            } else if (action.includes('Pay Now')) {
                showPayBills();
            } else if (action.includes('View Details')) {
                const parentCard = this.closest('.account-card');
                const accountType = parentCard?.querySelector('.account-type span')?.textContent;
                if (accountType?.includes('Credit')) {
                    showCreditCard();
                } else {
                    showFeatureModal(
                        '<i class="fas fa-info-circle"></i> Account Details',
                        `<p>Account details for ${accountType || 'your account'}</p>`
                    );
                }
            }
        });
    });
    
    // Add click handlers to pay buttons in bills section
    document.querySelectorAll('.pay-btn, .quick-pay').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showPayBills();
        });
    });
    
    // Add click handlers to schedule buttons
    document.querySelectorAll('.schedule-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showPayBills();
        });
    });
    
    // Add click handlers to filter links
    document.querySelectorAll('.filter-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            filterTransactions();
        });
    });
    
    // Add click handlers to download statement links
    document.querySelectorAll('.card-footer a').forEach(link => {
        if (link.textContent.includes('Download')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                downloadStatement();
            });
        }
    });
    
    // Add click handlers to tool items in insights
    document.querySelectorAll('.insights-tip').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            openBudgetPlanner();
        });
    });
    
    // Add click handlers to goal items
    document.querySelectorAll('.goal-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            showFinancialGoals();
        });
    });
    
    // Add click handlers to rewards elements
    document.querySelectorAll('.rewards-value, .rewards-earned').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            showRewards();
        });
    });
    
    // Add click handlers to branch locator
    document.querySelectorAll('[onclick*="findBranch"], .location-icon').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            findBranch();
        });
    });
    
    // Add click handlers to view all links
    document.querySelectorAll('.view-all, .header-actions a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showFeatureModal(
                '<i class="fas fa-list"></i> All Items',
                '<p>This would show a complete list.</p>'
            );
        });
    });
    
    console.log('Bank app initialized. Transfer feature ready!');
});

// Click outside modal to close
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const accountModal = document.getElementById('openAccountModal');
    
    if (event.target === loginModal) {
        hideLoginModal();
    }
    if (event.target === accountModal) {
        hideOpenAccount();
    }
};