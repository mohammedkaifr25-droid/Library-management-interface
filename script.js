let books = JSON.parse(localStorage.getItem('books')) || [
    { id: '1', title: 'Database Concepts', author: 'Silberschatz', isbn: '978-007', category: 'Computer Science', qty: 5, issued: 1 },
    { id: '2', title: 'Clean Code', author: 'Robert Martin', isbn: '978-013', category: 'Software Engineering', qty: 3, issued: 0 }
];

let txs = JSON.parse(localStorage.getItem('txs')) || [
    { id: 't1', bookId: '1', title: 'Database Concepts', borrower: 'Dhanush', issueDate: '2026-10-01', dueDate: '2026-10-15', status: 'Issued' }
];

function persist() {
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('txs', JSON.stringify(txs));
}

function switchTab(t) {
    document.getElementById('cat-section').classList.toggle('hidden', t !== 'cat');
    document.getElementById('tx-section').classList.toggle('hidden', t !== 'tx');
    document.getElementById('tab-cat-btn').className = t === 'cat' ? 'tab-btn active' : 'tab-btn';
    document.getElementById('tab-tx-btn').className = t === 'tx' ? 'tab-btn active' : 'tab-btn';
    if (t === 'tx') renderTxs(); else render();
}

function render() {
    const q = document.getElementById('search').value.toLowerCase();
    const catSelect = document.getElementById('catFilter');
    const cat = catSelect ? catSelect.value : '';
    const av = document.getElementById('availabilityFilter').value;

    const cats = [...new Set(books.map(b => b.category))];
    if (catSelect) {
        catSelect.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
        catSelect.value = cat;
    }

    const tbody = document.getElementById('bookTable');
    tbody.innerHTML = '';

    books.filter(b => {
        const matchQ = b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q);
        const matchC = !cat || b.category === cat;
        const avail = b.qty - b.issued;
        const matchA = !av || (av === 'yes' ? avail > 0 : avail === 0);
        return matchQ && matchC && matchA;
    }).forEach(b => {
        const avail = b.qty - b.issued;
        const availClass = avail > 0 ? 'success' : 'danger';
        tbody.innerHTML += `
            <tr>
                <td><div style="font-weight: 600;">${b.title}</div><div style="font-size: 0.75rem; color: #64748b;">by ${b.author}</div></td>
                <td style="font-family: monospace; font-size: 0.75rem;">${b.isbn}</td>
                <td><span class="badge-cat">${b.category}</span></td>
                <td style="text-align: center;"><span class="badge-avail ${availClass}">${b.qty} total / ${avail} avail</span></td>
                <td class="actions">
                    <button onclick="openIssue('${b.id}')" title="Issue" class="btn-icon success ${avail <= 0 ? 'disabled' : ''}"><i class="fa-solid fa-share"></i></button>
                    <button onclick="openEdit('${b.id}')" title="Edit" class="btn-icon primary"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="delBook('${b.id}')" title="Delete" class="btn-icon danger"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function renderTxs() {
    const tbody = document.getElementById('txTable');
    tbody.innerHTML = '';
    txs.forEach(t => {
        const ret = t.status === 'Returned';
        const statusClass = ret ? 'neutral' : 'warning';
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: 500;">${t.title}</td>
                <td>${t.borrower}</td>
                <td style="font-size: 0.75rem; color: #475569;">${t.issueDate} &rarr; ${t.dueDate}</td>
                <td style="text-align: center;"><span class="badge-avail ${statusClass}">${t.status}</span></td>
                <td class="actions">${!ret ? `<button onclick="returnBook('${t.id}')" class="btn-action-text">Return</button>` : '<span style="font-size: 0.75rem; color: #94a3b8;">Done</span>'}</td>
            </tr>`;
    });
}

function openBookModal() {
    document.getElementById('modalTitle').innerText = 'Add Book';
    document.getElementById('bookId').value = '';
    document.querySelector('#bookModalEl form').reset();
    document.getElementById('bookModalEl').classList.remove('hidden');
}

function openEdit(id) {
    const b = books.find(x => x.id === id);
    if (!b) return;
    document.getElementById('modalTitle').innerText = 'Edit Book';
    document.getElementById('bookId').value = b.id;
    document.getElementById('bTitle').value = b.title;
    document.getElementById('bAuthor').value = b.author;
    document.getElementById('bIsbn').value = b.isbn;
    document.getElementById('bCategory').value = b.category;
    document.getElementById('bQty').value = b.qty;
    document.getElementById('bookModalEl').classList.remove('hidden');
}

function closeBookModal() {
    document.getElementById('bookModalEl').classList.add('hidden');
}

function saveBook(e) {
    e.preventDefault();
    const id = document.getElementById('bookId').value;
    const title = document.getElementById('bTitle').value;
    const author = document.getElementById('bAuthor').value;
    const isbn = document.getElementById('bIsbn').value;
    const category = document.getElementById('bCategory').value;
    const qty = parseInt(document.getElementById('bQty').value);

    if (id) {
        const b = books.find(x => x.id === id);
        if (qty < b.issued) {
            alert('Qty cannot be less than issued copies.');
            return;
        }
        Object.assign(b, { title, author, isbn, category, qty });
    } else {
        books.push({ id: Date.now().toString(), title, author, isbn, category, qty, issued: 0 });
    }
    persist();
    closeBookModal();
    render();
}

function delBook(id) {
    const b = books.find(x => x.id === id);
    if (b.issued > 0) {
        alert('Cannot delete book with active issued copies.');
        return;
    }
    if (confirm('Delete this book?')) {
        books = books.filter(x => x.id !== id);
        persist();
        render();
    }
}

function openIssue(id) {
    const b = books.find(x => x.id === id);
    if (b.qty - b.issued <= 0) {
        alert('Out of stock!');
        return;
    }
    document.getElementById('issueBookId').value = id;
    document.getElementById('borrower').value = '';
    document.getElementById('dueDate').value = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    document.getElementById('issueModalEl').classList.remove('hidden');
}

function closeIssueModal() {
    document.getElementById('issueModalEl').classList.add('hidden');
}

function saveIssue(e) {
    e.preventDefault();
    const id = document.getElementById('issueBookId').value;
    const borrower = document.getElementById('borrower').value;
    const dueDate = document.getElementById('dueDate').value;
    const b = books.find(x => x.id === id);

    if (b.qty - b.issued <= 0) {
        alert('Out of stock!');
        closeIssueModal();
        return;
    }
    b.issued++;
    txs.unshift({
        id: 't' + Date.now(),
        bookId: id,
        title: b.title,
        borrower,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate,
        status: 'Issued'
    });
    persist();
    closeIssueModal();
    render();
    alert('Book issued successfully!');
}

function returnBook(txId) {
    const t = txs.find(x => x.id === txId);
    if (!t || t.status === 'Returned') return;
    const b = books.find(x => x.id === t.bookId);
    if (b) b.issued = Math.max(0, b.issued - 1);
    t.status = 'Returned';
    persist();
    renderTxs();
    alert('Book returned successfully.');
}

window.onload = render;
