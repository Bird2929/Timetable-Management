document.addEventListener('DOMContentLoaded', () => {
    const subjectList = document.getElementById('subjectList');
    const addSubjectBtn = document.getElementById('addSubjectBtn');

    let subjects = JSON.parse(localStorage.getItem('subjects')) || {};

    const addSubject = (subjectName) => {
        if (!subjectName.trim()) {
            alert('科目名を入力してください');
            return;
        }
        if (subjects[subjectName]) {
            alert('この科目はすでに追加されています');
            return;
        }
        subjects[subjectName] = Array.from({ length: 15 }, () => []);
        saveSubjects();
        renderSubject(subjectName);
    };    

    addSubjectBtn.addEventListener('click', () => {
        const subjectName = prompt('科目名を入力してください:');
        addSubject(subjectName);
    });

    const recordAttendance = (subjectName, status) => {
        const selectedClass = document.querySelector(`#history-${subjectName} .class-select`).value;
        if (subjectName && selectedClass) {
            const classIndex = selectedClass - 1;
            if (subjects[subjectName]) {
                subjects[subjectName][classIndex] = [status];
                saveSubjects();
                updateSubjectHistory(subjectName);
                const nextClass = parseInt(selectedClass) + 1;
                if (nextClass <= 15) {
                    document.querySelector(`#history-${subjectName} .class-select`).value = nextClass;
                } else {
                    alert('これが最後のコマです。次の科目に移動してください。');
                }
            }
        } else {
            alert('科目とコマを選択してください');
        }
    };

    const updateSubjectHistory = (subjectName) => {
        const historyDiv = document.getElementById(`history-${subjectName}`);
        historyDiv.innerHTML = '';
        const classSelect = document.createElement('select');
        classSelect.className = 'class-select';
        Array.from({ length: 15 }, (_, i) => {
            const opt = document.createElement('option');
            opt.value = i + 1;
            opt.textContent = `${i + 1}`;
            classSelect.appendChild(opt);
        });
        historyDiv.appendChild(classSelect);

        const recordsDiv = document.createElement('div');
        recordsDiv.className = 'attendance-records';
        subjects[subjectName].forEach((classes, index) => {
            const recordDiv = document.createElement('div');
            recordDiv.textContent = `${subjectName} ${index + 1}`;
            recordDiv.className = classes.length ? (classes[0] === '出席' ? 'attendance' : 'absence') : 'empty';
            recordDiv.addEventListener('click', () => {
                classSelect.value = index + 1;
                document.querySelectorAll('.attendance-records > div').forEach(d => d.classList.remove('selected'));
                recordDiv.classList.add('selected');
            });
            recordsDiv.appendChild(recordDiv);
        });
        historyDiv.appendChild(recordsDiv);

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
        const btnAttendance = document.createElement('button');
        btnAttendance.className = 'btn btn-success';
        btnAttendance.textContent = '出席';
        btnAttendance.addEventListener('click', () => recordAttendance(subjectName, '出席'));
        const btnAbsence = document.createElement('button');
        btnAbsence.className = 'btn btn-danger';
        btnAbsence.textContent = '欠席';
        btnAbsence.addEventListener('click', () => recordAttendance(subjectName, '欠席'));
        buttonGroup.appendChild(btnAttendance);
        buttonGroup.appendChild(btnAbsence);
        historyDiv.appendChild(buttonGroup);

        const absenceCount = document.querySelector(`#subjectList .subject-item[data-subject="${subjectName}"] .absence-count`);
        const totalAbsences = subjects[subjectName].flat().filter(status => status === '欠席').length;
        absenceCount.textContent = `欠席数: ${totalAbsences}`;
    };

    const saveSubjects = () => {
        localStorage.setItem('subjects', JSON.stringify(subjects));
    };

    const toggleHistory = (subjectName, event) => {
        event.stopPropagation();
        const historyDiv = document.getElementById(`history-${subjectName}`);
        if (historyDiv) {
            historyDiv.classList.toggle('open');
        }
    };

    const editSubject = (subjectName) => {
        const newName = prompt('新しい科目名を入力してください:', subjectName);
        if (newName && !subjects[newName]) {
            subjects[newName] = subjects[subjectName];
            delete subjects[subjectName];
            saveSubjects();
            const subjectItem = document.querySelector(`.subject-item[data-subject="${subjectName}"]`);
            subjectItem.querySelector('.subject-name').textContent = newName;
            subjectItem.setAttribute('data-subject', newName);
            updateSubjectHistory(newName);
        }
    };

    const deleteSubject = (subjectName) => {
        if (confirm(`本当に '${subjectName}' を削除しますか？`)) {
            delete subjects[subjectName];
            saveSubjects();
            const subjectItem = document.querySelector(`.subject-item[data-subject="${subjectName}"]`);
            subjectItem.remove();
        }
    };

    const renderSubject = (subjectName) => {
        const li = document.createElement('li');
        li.className = 'subject-item';
        li.setAttribute('data-subject', subjectName);
        li.innerHTML = `
            <div class="subject-header">
                <div class="subject-name">${subjectName}</div>
                <div class="absence-count">欠席数: 0</div>
                <button class="fold-btn">展開/折りたたみ</button>
            </div>
            <div class="buttons">
                <button class="edit-btn">変更</button>
                <button class="delete-btn">削除</button>
            </div>
            <div id="history-${subjectName}" class="history"></div>
        `;

        li.querySelector('.edit-btn').addEventListener('click', () => editSubject(subjectName));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteSubject(subjectName));
        li.querySelector('.fold-btn').addEventListener('click', (event) => toggleHistory(subjectName, event));

        li.addEventListener('click', () => {
            document.querySelectorAll('#subjectList li').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            const historyDiv = document.getElementById(`history-${subjectName}`);
            if (historyDiv) {
                historyDiv.scrollIntoView({ behavior: 'smooth' });
            }
        });

        subjectList.appendChild(li);
        updateSubjectHistory(subjectName);
    };

    // 初期データの読み込み
    Object.keys(subjects).forEach(subjectName => renderSubject(subjectName));
});
