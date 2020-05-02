window.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.custom-select-wrapper').addEventListener('click', function() {
        this.querySelector('.custom-select').classList.toggle('open');
    });

    let titles = localStorage.getItem('titles') ? JSON.parse(localStorage.getItem('titles')) : {},
        data = localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : [];

    function showCategories() {
        let listNav = document.querySelector('.list-nav ul'),
            customOptions = document.querySelector('.custom-options');

        listNav.innerHTML = '';
        customOptions.innerHTML = customOptions.firstChild.outerHTML;

        if(Object.entries(titles).length > 0){
            for(let key in titles) {
                // Show categories in table head
                listNav.innerHTML += `<li data-value=${key} id=${key}>${titles[key]}</li>`;
                listNavListener();
                // Show categories in dropdown list
                customOptions.innerHTML += "<span class='custom-option' data-value='" + key + "'>" + titles[key] + "</span>";
                dropdownEventListener();
            }
        } else {
            // console.log(titles.length);
            listNav.textContent = 'Ещё нет категорий';
        }
        dropdownEventListener();
    }

    function showList(a) {
        let listContent = document.querySelector('.list-content');
        listContent.innerHTML = '';
        // console.log(a);
        for (const li of document.querySelectorAll('.list-nav li')) {
            if (li.classList.contains('active')) li.classList.remove('active');
        }
        try {
            document.querySelector(`#${a}`).classList.add('active');
        }
        catch (e){}
        data.forEach((item, index) => {

            if (a === item['list']) {
                let doneClass = item['isDone'] ? 'done' : '';
                let doneIcon = doneClass ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>' : '<i class="fa fa-square-o" aria-hidden="true"></i>';
                listContent.innerHTML += `<div class="list-item ${doneClass}" data-index="${index}">
                        <div class="desc">${item['title']}</div>
                        <div class="buttons">
                            <ul>
                                <li data-value="${item['title']}" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></li>
                                <li data-value="${item['title']}" id="delete">
                                    <!--<i class="fa fa-trash-o" aria-hidden="true"></i>-->
                                    <i class="fa fa-minus-square-o" aria-hidden="true"></i>
                                </li>
                                <li data-value="${item['title']}" id="done">${doneIcon}</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
        });
        deleteElementListener();
        doneElementListener();
        editElementListener();
    }

    function dropdownEventListener () {
        let input = document.querySelector('.custom-option>input');
        for (const option of document.querySelectorAll(".custom-option")) {
            option.addEventListener('click', function() {
                if (!this.classList.contains('selected')) {
                    try {
                        this.parentNode.querySelector('.selected').classList.remove('selected');
                    }
                    catch (e) {
                        console.log(e);
                    }
                    this.classList.add('selected');
                    this.closest('.custom-select').querySelector('.custom-select__trigger span').dataset.value = this.dataset.value;
                    this.closest('.custom-select').querySelector('.custom-select__trigger span').innerHTML = this.innerHTML;
                    showList(this.dataset.value);

                    if (this.contains(input)) {
                        this.closest('.custom-select').querySelector('.custom-select__trigger').style.padding = '0';
                        this.closest('.custom-select').querySelector('#new_category').select();

                    } else {
                        this.closest('.custom-select').querySelector('.custom-select__trigger').style.padding = '10px 20px';
                    }
                }
            })
        }
    }

    function listNavListener () {
        let listNavItems = document.querySelectorAll('.list-nav ul li');

        for (const l of listNavItems) {
            l.addEventListener('click', function () {
                // console.log(this.dataset.value)
                showList(this.dataset.value);
            });
        }
    }

    function rusToTranslit (str) {
        let ru = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'j',
            'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh',
            'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya',
            '_': '_', '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
            '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
        },
        newStr = '';

        str = str.toLowerCase().replace(/\s/g, '_').replace(/[ъь]/g, '').replace(/[^0-9a-zа-я_]/g, "");

        for (let i = 0; i < str.length; i++){
            let char = ru[str[i]] ? ru[str[i]] : str[i];
            newStr += char;
        }
        return newStr;
    }

    function createElement() {

        let createForm = document.forms.create,
            name = createForm.title.value,
            category = createForm.querySelector('.custom-select__trigger span').dataset.value;

        if(!category) {
            alert('Выберите или создайте категорию');
            return false
        }
        if (category === 'add_category') {
            category = rusToTranslit(createForm.querySelector('.custom-select__trigger input').value);
            titles[category] = createForm.querySelector('.custom-select__trigger input').value;
            localStorage.setItem('titles', JSON.stringify(titles));
            createForm.querySelector('.custom-select__trigger #new_category').value = 'Новая категория...';
        }

        data.push({
                title: name,
                list: category,
                isDone: false
        });

        localStorage.setItem('data', JSON.stringify(data));
        createForm.title.value = 'Что нужно сделать';


        showCategories();
        showList(category);
    }

    function deleteElement() {

        let dataIndex = this.closest('.list-item').dataset.index,
            itemList = data[dataIndex]['list'];

        data.splice(dataIndex, 1);
        localStorage.setItem('data', JSON.stringify(data));

        let countTitle = 0;

        data.forEach((item) => {
            if (item['list'] === itemList) {
                countTitle++;
            }
        });

        if(!countTitle) {
            deleteCategory(itemList);
            showCategories();
            showList(Object.keys(titles)[0])
        } else {
            showList(itemList);
        }

    }

    function doneElementListener() {
        for (const item of document.querySelectorAll('#done')) {
            item.addEventListener('click', doneElement);
        }
    }

    function doneElement() {
        let dataIndex = this.closest('.list-item').dataset.index;

        data[dataIndex]['isDone'] = !data[dataIndex]['isDone'];
        localStorage.setItem('data', JSON.stringify(data));
        showList(data[dataIndex]['list']);
        // data.forEach((item) => {
        //     if (item['title'] === this.dataset.value) {git push
        //         item['isDone'] = !item['isDone'];
        //         localStorage.setItem('data', JSON.stringify(data));
        //         showList(item['list']);
        //     }
        // })
    }

    function deleteElementListener() {
        for (const item of document.querySelectorAll('#delete')) {item.addEventListener('click', deleteElement)};
    }

    function deleteCategory (catName) {
         delete titles[catName];
         localStorage.setItem('titles', JSON.stringify(titles));
    }

    function showEditInput() {
        this.closest('.list-item').querySelector('.desc').innerHTML = `<form id="edit_item" method="POST" ><input type="text";
            value="${this.closest('.list-item').querySelector('.desc').innerHTML}"></form>`;
        let dataIndex = (this.closest('.list-item').dataset.index);
        this.removeEventListener('click', showEditInput);
        document.querySelector('#edit_item').addEventListener('submit', function (e) {
            e.preventDefault();

            data[dataIndex]['title'] = this.querySelector('input').value;
            localStorage.setItem('data', JSON.stringify(data));
            showList(data[dataIndex]['list']);
        })
    }

    function editElementListener () {
        for (const item of document.querySelectorAll('#edit')) {
            // console.log(item);
            item.addEventListener('click', showEditInput);
        }
    }

    window.addEventListener('click', function(e) {
        const select = document.querySelector('.custom-select');
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });

    showCategories();

    try {
        showList(Object.keys(titles)[0]);
    } catch (e) {
        console.log(e);
    }

    deleteElementListener();
    doneElementListener();
    editElementListener();

    document.forms.create.querySelector('button').addEventListener('click', function (e) {
        e.preventDefault();
        createElement();
    });
});