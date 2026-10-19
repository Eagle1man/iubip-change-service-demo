// Демонстрационные данные. Все фамилии вымышлены, разделы упрощены.
// Реальный Перечень в открытый репозиторий не выкладывается.

const DEMO = {
  // Роли демо-режима
  roles: [
    { id: 'staff',   label: 'Исполнитель',          fio: 'Петрова Анна Сергеевна',   position: 'Специалист 1 категории' },
    { id: 'responsible', label: 'Ответственное лицо', fio: 'Ковалёв Игорь Матвеевич', position: 'Руководитель отдела' },
    { id: 'admin',   label: 'Администратор сайта',  fio: 'Соловьёв Артём Львович',   position: 'Начальник отдела сопровождения' },
  ],

  // Разделы. id_block, url и selector подставлены «генератором реестра»:
  // в форме они доступны только для чтения.
  sections: [
    {
      id: 1, num: '1.1', title: 'Основные сведения',
      id_block: 'main-1-1', url: 'https://example-vo.ru/sveden/common/',
      selector: '#main-info', block_path: 'блок Основные сведения',
      content_type: 'text', table_num: '3.2.2, 3.2.3',
    },
    {
      id: 2, num: '1.2', title: 'Лицензия на образовательную деятельность',
      id_block: 'lic-1-2', url: 'https://example-vo.ru/sveden/license/',
      selector: '#license-card', block_path: 'карточка Лицензия',
      content_type: 'document', table_num: '3.3.1',
    },
    {
      id: 3, num: '3.4', title: 'Учебные планы и рабочие программы',
      id_block: 'edu-3-4', url: 'https://example-vo.ru/sveden/education/',
      selector: '#programs-table', block_path: 'таблица Рабочие программы',
      content_type: 'table', table_num: '4.1',
    },
    {
      id: 4, num: '8.2', title: 'Материально-техническое обеспечение',
      id_block: 'mto-8-2', url: 'https://example-vo.ru/sveden/mto/',
      selector: '#mto-block', block_path: 'блок МТО',
      content_type: 'text', table_num: '5.6',
    },
    {
      id: 5, num: '12.1', title: 'Вакантные места для приёма (перевода)',
      id_block: 'vacant-12-1', url: 'https://example-vo.ru/sveden/vacant/',
      selector: '#vacant-table', block_path: 'таблица Вакантные места',
      content_type: 'table', table_num: '6.1',
    },
  ],

  // Восемь кодов отказа — закрытый список, п. 6 приказа
  codes: [
    { code: 'F-01', text: 'Неструктурированный формат' },
    { code: 'F-02', text: 'Неверное имя файла' },
    { code: 'F-03', text: 'Не заполнено обязательное поле' },
    { code: 'F-04', text: 'Раздел или URL не найден' },
    { code: 'R-01', text: 'id_block отсутствует в реестре' },
    { code: 'R-02', text: 'Значение не совпадает с реестром' },
    { code: 'C-01', text: 'Тип содержимого не соответствует блоку' },
    { code: 'C-02', text: 'Приложенный файл отсутствует' },
  ],

  // Стартовая очередь — одна заявка «со вчерашнего дня», чтобы форма решения была не пустой
  seedQueue: [
    {
      id: 3,
      section_id: 4,
      section: '8.2. Материально-техническое обеспечение',
      author: 'Кузнецова Мария Павловна',
      author_position: 'Ведущий специалист',
      responsible: 'Ковалёв Игорь Матвеевич',
      responsible_position: 'Руководитель отдела',
      action: 'update',
      change_date: '2026-10-14',
      due_date: '2026-10-27',
      reason: 'Обновление сведений о лабораторном оборудовании',
      content_type: 'text',
      content: { title: 'Материально-техническое обеспечение', body: 'В учебном процессе используются 12 лабораторных комплексов.' },
      status: 'queued',
    },
  ],
};

const HINTS = {
  login: 'Демо-вход в один клик. Выберите роль — у каждой своя права и свой экран.',
  form: 'Раздел выбирается из списка. Поля идентификатора подставляются сами и заблокированы для ввода.',
  queue: 'Ответственное лицо согласует либо возвращает. Возврат возможен только с одним из восьми кодов.',
  yaml: 'На выходе — файл в формате Приложения 2. Имя файла собирается автоматически.',
};
