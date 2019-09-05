import Parser from "../parser/main.js";

const Articles = {

    arr: [],
    themes: ['О новых проектах в компании', 'Наши события', 'Поздравляем!', 'Знакомство с новенькими'],
    getLast(){
        return this.arr[this.arr.length-1];
    },
    production(){
        const controls = document.querySelectorAll('.controlSection, #addSectionBtn');
        controls.forEach(item => {
            item.remove();
        });
        document.head.querySelector('style').innerHTML = '@import url(\'https://fonts.googleapis.com/css?family=Open+Sans:300,400,600\');'
    }

};

const templates = {
    addSectionBtn: document.querySelector('#article__addSection-btn'),
    sectionControlBtns: document.querySelector('#article__controlSection-btns'),

    articleHeaderFirst: document.querySelector('#article__header-first'),
    articleBodyFirst: document.querySelector('#article__body-first'),
    articleHeader: document.querySelector('#article__header'),
    articleBody: document.querySelector('#article__body'),
    articleEnd: document.querySelector('#article__end'),

    titleH3: document.querySelector('#title__h3'),
    titleH4: document.querySelector('#title__h4'),

    textStandart: document.querySelector('#text__standart'),
    textStandartModify: document.querySelector('#text__standart-modify'),
    textStandartModifyAccent: document.querySelector('#text__standart-modify-accent'),

    imageBig: document.querySelector('#image__big'),
    imageFace: document.querySelector('#image__face'),

    line: document.querySelector('#line')
};

const allTables = document.querySelectorAll('table');

const HTML = {

    prodBtn: document.getElementById('prod'),

    insertArticle: allTables[allTables.length-2],

    createArticleBtn: document.getElementById('createArticleBtn'),

    articleTheme: document.getElementById('articleTheme'),

    articleImg: document.getElementById('article-img'),

    createSectionBtn: document.getElementById('createSectionBtn'),

    sectionType: document.getElementById('sectionType'),

    setListeners(){
        this.createArticleBtn.addEventListener('click', () => {
            const articleTheme = {
                theme: this.articleTheme.value,
                index: this.articleTheme.selectedIndex
            };
            if (Articles.arr.length && !!Articles.getLast().addBtn) {
                Articles.getLast().createSection(9);
                Articles.getLast().removeSectionBtn();
            }
            Articles.arr.push(new Article(articleTheme, !Articles.arr.length));
        });

        this.createSectionBtn.addEventListener('click', () => {
            const index = this.sectionType.selectedIndex;
            Articles.getLast().createSection(index, document.querySelector('#sectionInputData').value);
        });

        // this.sectionType.addEventListener('change', (e) => {
        //     this.sectionInputData.placeholder = (this.sectionType.selectedIndex < 6) ? 'Введите текст' :
        //                                         (this.sectionType.selectedIndex === 6 || this.sectionType.selectedIndex === 7) ? 'data: image Base64' : '';
        // });

        this.prodBtn.addEventListener('click', Articles.production);

        $('.btn__add').magnificPopup({type: 'inline'});
    }
};

HTML.setListeners();

class Article {

    constructor(articleTheme, isFirst = false){
        if (isFirst) {
            this.HTMLHeader = templates.articleHeaderFirst.content.querySelector('table').cloneNode(true);
            this.HTMLBody = templates.articleBodyFirst.content.querySelector('table').cloneNode(true);
        }
        else {
            this.HTMLHeader = templates.articleHeader.content.querySelector('table').cloneNode(true);
            this.HTMLBody = templates.articleBody.content.querySelector('table').cloneNode(true);
        }
        this.sections = [];
        this.theme = articleTheme.theme;
        this.title = Articles.themes[articleTheme.index];
        this.addBtn = templates.addSectionBtn.content.querySelector('tr').cloneNode(true);
        this.createHTML();
    }

    sectionBtn(){
        let textarea;
        this.HTMLBody.querySelector('table table tbody').appendChild(this.addBtn);
        this.toInsertSection = this.HTMLBody.querySelector('#addSectionBtn');

        $(this.addBtn).find('a').magnificPopup({
            type: 'inline',
            callbacks: {
                open: function(){
                    textarea = document.querySelector('#sectionInput').children;
                    textarea[0].insertAdjacentHTML('afterend', '<textarea id="sectionInputData"></textarea>');
                    $(textarea[1]).cleditor({
                        // controls: "bold italic underline | bullets numbering | alignleft center alignright justify | undo redo | rule link unlink | source"
                    });
                },
                close: function(){
                    textarea[1].remove();
                }
            }
        });
    }

    removeSectionBtn(){
        this.addBtn.remove();
    }

    createHeader(){
        this.HTMLHeader.querySelector('h2>b').innerText = this.theme;
        this.HTMLHeader.querySelector('p').innerText = this.title;
    }

    insertArticle(){
        HTML.insertArticle.before(this.HTMLHeader, this.HTMLBody);
    }

    createHTML() {
        this.createHeader();
        this.sectionBtn();
        this.insertArticle();
    }

    createSection(index, data){
        const sectionTypeClass = (index < 2) ? new Title(data, index) :
                                 (index >= 2 && index < 6) ? new Text(data, index) :
                                 (index === 6 || index === 7) ? new Photo(data, index) :
                                 (index === 8 || index === 9) ? new Elements(index) : null;
        this.sections.push(sectionTypeClass);
        this.toInsertSection.before(sectionTypeClass.HTML);
    }

}

class Section{

    constructor(value){
        this.data = value;
    }

    addControlBtns(){
        let textarea;
        this.HTML.querySelector('td').style.position = 'relative';
        const template = templates.sectionControlBtns.content.querySelector('td').cloneNode(true);
        template.querySelector('#section__remove').addEventListener('click', this.removeSection.bind(this));

        $(template.querySelector('#section__edit')).magnificPopup({
            type: 'inline',
            callbacks: {
                open: () => {
                    textarea = document.querySelector('#sectionEditor').children;
                    textarea[0].insertAdjacentHTML('beforebegin', '<textarea id="editor"></textarea>');
                    $(textarea[0]).val($(textarea[0]).val()+ this.data);
                    $(textarea[0]).cleditor({
                        // controls: "bold italic underline | bullets numbering | alignleft center alignright justify | undo redo | rule link unlink | source"
                    });
                    $('#editSectionBtn').on('click', this.editSection.bind(this));

                },
                close: function(){
                    $("#editSectionBtn").unbind('click');
                    textarea[0].remove();
                }
            }
        });
        this.HTML.querySelector('td').appendChild(template);
    }

    editSection(){
        this.data = $(".cleditorMain iframe").contents().find('body').html();
        this.insertContent();
        $.magnificPopup.close();
    }

    removeSection(){
        const currArticle = Articles.getLast();
        currArticle.sections.splice(currArticle.sections.indexOf(this), 1);
        this.HTML.remove();
    }

}

class Title extends Section{

    constructor(value, type){
        super(value);
        this.HTML = (!type) ? templates.titleH3.content.querySelector('tr').cloneNode(true):
                              templates.titleH4.content.querySelector('tr').cloneNode(true);
        this.insertContent();
        this.addControlBtns();
    }

    insertContent(){
        const parseText = new Parser(this.data);
        this.HTML.querySelector('b').innerHTML = parseText.getResult();
    }

}

class Text extends Section{

    constructor(value, type){
        super(value);
        this.HTML = (type === 2 || type === 3) ? templates.textStandart.content.querySelector('tr').cloneNode(true) :
                    (type === 4) ? templates.textStandartModify.content.querySelector('tr').cloneNode(true) :
                    (type === 5) ? templates.textStandartModifyAccent.content.querySelector('tr').cloneNode(true) : null;
        if (type === 3) this.HTML.querySelector('tr>td').style.paddingBottom = '0';
        this.insertContent();
        this.addControlBtns();
    }

    insertContent(){
        const parseText = new Parser(this.data);
        this.HTML.querySelector('p').innerHTML = parseText.getResult();
    }

}

class Photo extends Section{

    constructor(value, index){
        super(value);
        this.HTML =  (index === 6) ? templates.imageBig.content.querySelector('tr').cloneNode(true) :
                                    templates.imageFace.content.querySelector('tr').cloneNode(true);
        this.insertContent();
        this.addControlBtns();
    }

    insertContent(){
        this.HTML.querySelector('img').src = this.data;
    }

}

class Elements extends Section{

    constructor(index){
        super();
        this.HTML = (index === 8) ? templates.line.content.querySelector('tr').cloneNode(true) :
                                    templates.articleEnd.content.querySelector('tr').cloneNode(true);
    }

}