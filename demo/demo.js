// Интерактивное демо сервиса приёма изменений.
// Работает без сервера: всё состояние живёт в памяти страницы.

(function () {
  'use strict';

  const screen = document.getElementById('screen');
  const hint = document.getElementById('stage-hint');
  const stageList = document.getElementById('stage-list');

  let state = null;

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function reset() {
    state = {
      role: null,
      user: null,
      queue: DEMO.seedQueue.map(r => ({ ...r })),
      nextId: 4,
      currentRequestId: null,
      stage: 'login',
    };
    render();
  }

  function setStage(stage) {
    state.stage = stage;
    hint.textContent = HINTS[stage] || '';
    [...stageList.children].forEach(li => {
      li.classList.toggle('is-active', li.dataset.stage === stage);
    });
    render();
  }

  // ---------- разметка экранов ----------

  function render() {
    const views = {
      login: viewLogin,
      form: viewForm,
      queue: viewQueue,
      yaml: viewYaml,
      done: viewDone,
    };
    screen.innerHTML = (views[state.stage] || viewLogin)();
    bind();
  }

  function viewLogin() {
    const cards = DEMO.roles.map(r => `
      <button class="role-card" data-role="${r.id}">
        <span class="role-label">${esc(r.label)}</span>
        <span class="role-fio">${esc(r.fio)}</span>
        <span class="role-pos">${esc(r.position)}</span>
      </button>`).join('');
    return `
      <div class="panel">
        <h2>Вход в сервис</h2>
        <p class="muted">В реальном сервисе здесь Ф.И.О. и пароль. В демо выберите роль.</p>
        <div class="role-grid">${cards}</div>
        <p class="fineprint">Пароль выдаёт Ответственное лицо. Одноразовый пароль требует смены при первом входе.</p>
      </div>`;
  }

  function viewForm() {
    const opts = DEMO.sections.map(s =>
      `<option value="${s.id}" data-type="${s.content_type}">${esc(s.num)} — ${esc(s.title)}</option>`
    ).join('');
    const u = state.user;
    return `
      <div class="panel">
        <h2>Новая заявка на изменение</h2>
        <p class="muted">
          Раздел выбирается из Перечня. <code>id_block</code>, <code>url</code>,
          <code>selector</code> и <code>block_path</code> подставляются автоматически —
          вручную их ввести нельзя.
        </p>

        <form id="req-form" novalidate>
          <fieldset>
            <legend>Что меняем</legend>

            <label class="fld">
              <span>Раздел сайта</span>
              <select name="section_id" id="f-section"><option value="">— выберите —</option>${opts}</select>
            </label>

            <div class="autofill" id="f-autofill">
              <label><span>id_block</span><input id="f-id_block" readonly value=""></label>
              <label><span>url</span><input id="f-url" readonly value=""></label>
              <label><span>selector</span><input id="f-selector" readonly value=""></label>
              <label><span>block_path</span><input id="f-block_path" readonly value=""></label>
            </div>
            <p class="lock-note">&#128274; Поля заблокированы: значения берутся из реестра блоков.</p>

            <label class="fld">
              <span>Тип содержимого</span>
              <select name="content_type" id="f-type" disabled>
                <option value="text">текст</option>
                <option value="table">таблица</option>
                <option value="document">документ</option>
              </select>
            </label>
            <p class="lock-note">Тип определяет блок, а не человек.</p>

            <label class="fld">
              <span>Действие</span>
              <select name="action">
                <option value="update">обновить содержимое</option>
                <option value="create">создать блок</option>
                <option value="delete">удалить блок</option>
              </select>
            </label>

            <div class="row2">
              <label class="fld">
                <span>Дата изменения</span>
                <input type="date" name="change_date" id="f-date" value="2026-10-16" required>
              </label>
              <label class="fld">
                <span>Срок публикации</span>
                <input type="date" name="due_date" id="f-due" value="2026-10-27" required>
              </label>
            </div>
            <button type="button" class="btn-ghost btn-small" id="f-calc">Рассчитать срок</button>
            <p class="fineprint">Срок = дата изменения + 10 рабочих дней − 3 рабочих дня.</p>

            <label class="fld">
              <span>Причина изменения</span>
              <textarea name="reason" rows="2" required>Обновление контактных данных</textarea>
            </label>
          </fieldset>

          <fieldset>
            <legend>Кто передаёт</legend>
            <div class="row2">
              <label class="fld"><span>Должность Исполнителя</span>
                <input name="author_position" value="${esc(u.position)}" required></label>
              <label class="fld"><span>Ф.И.О. Исполнителя</span>
                <input name="author_fio" value="${esc(u.fio)}" required></label>
            </div>
            <div class="row2">
              <label class="fld"><span>Должность Ответственного лица</span>
                <input name="responsible_position" value="Руководитель отдела" required></label>
              <label class="fld"><span>Ф.И.О. Ответственного лица</span>
                <input name="responsible_fio" value="${esc(DEMO.roles[1].fio)}" required></label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Содержимое</legend>
            <div data-block="text">
              <label class="fld"><span>Заголовок</span><input name="title" value="Основные сведения"></label>
              <label class="fld"><span>Текст</span><textarea name="body" rows="4">Приёмная: +7 (000) 000-00-00, пн–пт 8:00–17:00.</textarea></label>
            </div>
            <div data-block="table" hidden>
              <label class="fld"><span>Заголовок таблицы</span><input name="table_title"></label>
              <label class="fld"><span>Колонки через точку с запятой</span><input name="columns" placeholder="Код; Наименование; Уровень"></label>
              <label class="fld"><span>Строки (через <code>|</code>)</span><textarea name="rows" rows="3" placeholder="01.03.02; Землеустройство; бакалавриат"></textarea></label>
            </div>
            <div data-block="document" hidden>
              <label class="fld"><span>Заголовок</span><input name="doc_title"></label>
              <label class="fld"><span>Файл (PDF, DOCX, XLSX)</span><input type="file" name="file"></label>
            </div>
            <p class="fineprint">Электронная подпись при загрузке не требуется.</p>
          </fieldset>

          <div id="f-error" class="error-box" hidden></div>
          <button type="submit" class="btn-primary btn">Отправить на согласование</button>
        </form>
      </div>`;
  }

  function viewQueue() {
    if (!state.queue.length) {
      return `<div class="panel"><h2>Очередь согласования</h2>
        <p class="muted">Очередь пуста. Вернитесь в форму и создайте заявку.</p></div>`;
    }
    const rows = state.queue.map(r => {
      const s = DEMO.sections.find(x => x.id === r.section_id) || {};
      const decision = r.status === 'queued' ? `
        <div class="decision">
          <button class="btn-ok btn-small" data-approve="${r.id}">Согласовать</button>
          <div class="reject-row">
            <select data-code-for="${r.id}">
              ${DEMO.codes.map(c => `<option value="${c.code}">${c.code} — ${esc(c.text)}</option>`).join('')}
            </select>
            <button class="btn-err btn-small" data-reject="${r.id}">Вернуть</button>
          </div>
        </div>` : `<span class="pill ${r.status === 'approved' ? 'pill-ok' : 'pill-warn'}">
            ${r.status === 'approved' ? 'согласована' : 'возвращена: ' + esc(r.reject_code)}</span>`;
      return `
        <article class="req">
          <header class="req-head">
            <strong>#${r.id}</strong> <span>${esc(r.section)}</span>
          </header>
          <dl class="req-meta">
            <dt>Исполнитель</dt><dd>${esc(r.author_position)}, ${esc(r.author)}</dd>
            <dt>Ответственное</dt><dd>${esc(r.responsible_position)}, ${esc(r.responsible)}</dd>
            <dt>Действие</dt><dd>${esc(r.action)}</dd>
            <dt>Срок</dt><dd>${esc(r.change_date)} → <strong>${esc(r.due_date)}</strong></dd>
            <dt>id_block</dt><dd><code>${esc(s.id_block || '—')}</code></dd>
            <dt>Причина</dt><dd>${esc(r.reason)}</dd>
          </dl>
          ${decision}
        </article>`;
    }).join('');
    return `
      <div class="panel">
        <h2>Очередь согласования</h2>
        <p class="muted">
          Отказ возможен <strong>только</strong> по формальному основанию — из закрытого
          списка кодов. Содержательных причин в форме нет и быть не может.
        </p>
        ${rows}
      </div>`;
  }

  function viewYaml() {
    const r = state.queue.find(x => x.id === state.currentRequestId);
    if (!r) return '<div class="panel"><p class="muted">Заявка не найдена.</p></div>';
    const s = DEMO.sections.find(x => x.id === r.section_id) || {};
    const name = `iubip_${s.id_block || 'block'}_${r.change_date.replace(/-/g, '')}.yml`;
    return `
      <div class="panel">
        <h2>Готовый файл заявки</h2>
        <p class="muted">
          Формат — Приложение 2 к приказу. Имя файла <code>${esc(name)}</code>
          собрано автоматически.
        </p>
        <pre class="yaml">${esc(buildYaml(r, s))}</pre>
        <div class="yaml-actions">
          <button class="btn-primary btn" id="y-download" data-name="${esc(name)}">Скачать файл</button>
          <button class="btn-ghost btn" id="y-back">Вернуться в очередь</button>
        </div>
      </div>`;
  }

  function viewDone() {
    const r = state.queue.find(x => x.id === state.currentRequestId);
    return `
      <div class="panel">
        <h2>Заявка #${r.id} отправлена</h2>
        <p class="muted">
          Заявка лежит в очереди Ответственного лица. В демо откройте роль
          «Ответственное лицо», чтобы согласовать её или вернуть.
        </p>
        <div class="yaml-actions">
          <button class="btn-primary btn" id="d-queue">Перейти в очередь</button>
          <button class="btn-ghost btn" id="d-form">Создать ещё одну</button>
        </div>
      </div>`;
  }

  // ---------- сборка YAML (зеркало серверного yaml-builder) ----------

  function scalar(v) {
    if (v == null) return '""';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    return '"' + String(v).replace(/"/g, '\\"') + '"';
  }
  const ind = (n, s) => '  '.repeat(n) + s;

  function buildYaml(r, s) {
    const out = ['---'];
    out.push(`id_block: ${scalar(s.id_block)}`);
    out.push(`section: ${scalar(r.section)}`);
    out.push(`url: ${scalar(s.url)}`);
    out.push(`selector: ${scalar(s.selector)}`);
    out.push(`block_path: ${scalar(s.block_path)}`);
    out.push(`action: ${scalar(r.action)}`);
    out.push(`author_position: ${scalar(r.author_position)}`);
    out.push(`author_fio: ${scalar(r.author)}`);
    out.push(`responsible_position: ${scalar(r.responsible_position)}`);
    out.push(`responsible_fio: ${scalar(r.responsible)}`);
    out.push(`change_date: ${scalar(r.change_date)}`);
    out.push(`reason: ${scalar(r.reason)}`);
    out.push('legal_basis: ""');
    out.push(`due_date: ${scalar(r.due_date)}`);
    out.push('content:');
    out.push(ind(1, `type: ${scalar(r.content_type)}`));
    if (r.content_type === 'table') {
      out.push(ind(1, `title: ${scalar(r.content.title || 'Таблица')}`));
      out.push(ind(1, 'columns: [' + ['Код', 'Наименование', 'Уровень'].map(scalar).join(', ') + ']'));
      out.push(ind(1, 'rows:'));
      out.push(ind(2, '- [' + ['01.03.02', 'Землеустройство', 'бакалавриат'].map(scalar).join(', ') + ']'));
      out.push(ind(1, `note: ${scalar('Информация актуальна на ' + r.change_date)}`));
    } else if (r.content_type === 'document') {
      out.push(ind(1, `title: ${scalar(r.content.title || 'Документ')}`));
      out.push(ind(1, 'file:'));
      out.push(ind(2, 'name: "document.pdf"'));
      out.push(ind(2, 'path: "files/document.pdf"'));
      out.push(ind(2, 'format: "pdf"'));
      out.push(ind(2, 'signed_ep: false'));
    } else {
      out.push(ind(1, `title: ${scalar(r.content.title)}`));
      if (r.content.body) {
        out.push(ind(1, 'body: |'));
        String(r.content.body).split('\n').forEach(line => out.push(ind(2, line)));
      }
    }
    return out.join('\n') + '\n';
  }

  // ---------- подстановка и обработчики ----------

  function bind() {
    screen.querySelectorAll('[data-role]').forEach(b => {
      b.addEventListener('click', () => {
        const role = DEMO.roles.find(x => x.id === b.dataset.role);
        state.role = role.id;
        state.user = role;
        setStage(role.id === 'staff' ? 'form' : 'queue');
      });
    });

    const form = document.getElementById('req-form');
    if (form) {
      const sectionSel = document.getElementById('f-section');
      const typeSel = document.getElementById('f-type');
      const lockNote = form.querySelector('.lock-note');

      sectionSel.addEventListener('change', () => {
        const s = DEMO.sections.find(x => x.id === Number(sectionSel.value));
        ['id_block', 'url', 'selector', 'block_path'].forEach(k => {
          document.getElementById('f-' + k).value = s ? s[k] : '';
        });
        if (s) {
          typeSel.value = s.content_type;
          form.querySelectorAll('[data-block]').forEach(el => {
            el.hidden = el.dataset.block !== s.content_type;
          });
        }
        void lockNote;
      });

      document.getElementById('f-calc').addEventListener('click', () => {
        const v = document.getElementById('f-date').value;
        if (!v) { alert('Сначала укажите дату изменения.'); return; }
        document.getElementById('f-due').value = calcDue(v);
      });

      form.addEventListener('submit', e => {
        e.preventDefault();
        const errBox = document.getElementById('f-error');
        const sectionId = Number(sectionSel.value);
        if (!sectionId) { showErr(errBox, 'F-03 — Не выбран раздел сайта'); return; }
        const s = DEMO.sections.find(x => x.id === sectionId);
        const fd = new FormData(form);
        if (!String(fd.get('reason') || '').trim()) { showErr(errBox, 'F-03 — Не заполнено обязательное поле «Причина изменения»'); return; }
        if (s.content_type === 'document' && !fd.get('file').name) { showErr(errBox, 'C-02 — Приложенный файл отсутствует'); return; }
        errBox.hidden = true;

        const u = state.user;
        const rec = {
          id: state.nextId++,
          section_id: s.id,
          section: `${s.num}. ${s.title}`,
          author: u.fio, author_position: u.position,
          responsible: fd.get('responsible_fio'), responsible_position: fd.get('responsible_position'),
          action: fd.get('action'),
          change_date: fd.get('change_date'), due_date: fd.get('due_date'),
          reason: fd.get('reason'),
          content_type: s.content_type,
          content: {
            title: fd.get('title') || fd.get('table_title') || fd.get('doc_title') || s.title,
            body: fd.get('body') || '',
          },
          status: 'queued',
        };
        state.queue.unshift(rec);
        state.currentRequestId = rec.id;
        setStage('done');
      });
    }

    screen.querySelectorAll('[data-approve]').forEach(b => {
      b.addEventListener('click', () => {
        const r = state.queue.find(x => x.id === Number(b.dataset.approve));
        r.status = 'approved';
        state.currentRequestId = r.id;
        setStage('yaml');
      });
    });

    screen.querySelectorAll('[data-reject]').forEach(b => {
      b.addEventListener('click', () => {
        const id = Number(b.dataset.reject);
        const sel = screen.querySelector(`[data-code-for="${id}"]`);
        const r = state.queue.find(x => x.id === id);
        r.status = 'rejected';
        r.reject_code = sel.value;
        const code = DEMO.codes.find(c => c.code === sel.value);
        render();
        const note = document.createElement('p');
        note.className = 'note';
        note.innerHTML = `Заявка возвращена исполнителю. Основание: <strong>${esc(sel.value)}</strong> — ${esc(code.text)}.<br>
          <span class="fineprint">Обратите внимание: в форме нет свободной причины. Содержательное замечание выставить нельзя.</span>`;
        screen.querySelector('.panel').appendChild(note);
      });
    });

    const dl = document.getElementById('y-download');
    if (dl) {
      dl.addEventListener('click', () => {
        const r = state.queue.find(x => x.id === state.currentRequestId);
        const s = DEMO.sections.find(x => x.id === r.section_id) || {};
        const blob = new Blob([buildYaml(r, s)], { type: 'application/yaml;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = dl.dataset.name;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }
    const back = document.getElementById('y-back');
    if (back) back.addEventListener('click', () => setStage('queue'));

    const q = document.getElementById('d-queue');
    if (q) q.addEventListener('click', () => setStage('queue'));
    const f = document.getElementById('d-form');
    if (f) f.addEventListener('click', () => setStage('form'));
  }

  function showErr(box, text) {
    box.textContent = text;
    box.hidden = false;
  }

  // due_date = change_date + 10 рабочих дней − 3 рабочих дня
  function calcDue(iso) {
    const d = new Date(iso + 'T00:00:00Z');
    let added = 0;
    while (added < 10) {
      d.setUTCDate(d.getUTCDate() + 1);
      const dow = d.getUTCDay();
      if (dow !== 0 && dow !== 6) added++;
    }
    let removed = 0;
    while (removed < 3) {
      d.setUTCDate(d.getUTCDate() - 1);
      const dow = d.getUTCDay();
      if (dow !== 0 && dow !== 6) removed++;
    }
    return d.toISOString().slice(0, 10);
  }

  document.getElementById('nav-reset').addEventListener('click', e => {
    e.preventDefault();
    reset();
  });

  reset();
})();
