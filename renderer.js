document.addEventListener('DOMContentLoaded', () => {
  const contentDiv = document.getElementById('content');
  const addModuleBtn = document.getElementById('add-module');
  const toggleOnTopBtn = document.getElementById('toggle-on-top');
  const closeBtn = document.getElementById('close-btn');

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalInputKey = document.getElementById('modal-input-key');
  const modalInputValue = document.getElementById('modal-input-value');
  const modalSaveButton = document.getElementById('modal-save-button');
  const closeButton = document.querySelector('.close-button');

  let resumeData = {};
  let editingKey = null;

  const render = () => {
    contentDiv.innerHTML = '';
    Object.keys(resumeData).forEach((key, index) => {
      const moduleDiv = document.createElement('div');
      moduleDiv.className = 'module';
      moduleDiv.dataset.key = key;

      const headerDiv = document.createElement('div');
      headerDiv.className = 'module-header';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'module-title';
      titleSpan.textContent = key;
      headerDiv.appendChild(titleSpan);

      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'module-controls';

      const upBtn = document.createElement('button');
      upBtn.textContent = '🔼';
      upBtn.title = '上移模块'; // 添加title属性
      upBtn.onclick = () => moveModule(index, -1);
      controlsDiv.appendChild(upBtn);

      const downBtn = document.createElement('button');
      downBtn.textContent = '🔽';
      downBtn.title = '下移模块'; // 添加title属性
      downBtn.onclick = () => moveModule(index, 1);
      controlsDiv.appendChild(downBtn);

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.title = '编辑模块'; // 添加title属性
      editBtn.onclick = () => openModal(key);
      controlsDiv.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.title = '删除模块'; // 添加title属性
      deleteBtn.onclick = () => deleteModule(key);
      controlsDiv.appendChild(deleteBtn);

      const copyBtn = document.createElement('button');
      copyBtn.textContent = '📄';
      copyBtn.title = '复制模块内容'; // 添加title属性
      copyBtn.onclick = () => copyModule(key);
      controlsDiv.appendChild(copyBtn);

      headerDiv.appendChild(controlsDiv);
      moduleDiv.appendChild(headerDiv);

      const moduleContentDiv = document.createElement('div');
      moduleContentDiv.className = 'module-content';

      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      const itemPre = document.createElement('pre');
      itemPre.textContent = resumeData[key];
      itemDiv.appendChild(itemPre);
      moduleContentDiv.appendChild(itemDiv);

      moduleDiv.appendChild(moduleContentDiv);
      contentDiv.appendChild(moduleDiv);
    });
  };

  const moveModule = (index, direction) => {
    const keys = Object.keys(resumeData);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= keys.length) return;

    const newResumeData = {};
    const [movedKey] = keys.splice(index, 1);
    keys.splice(newIndex, 0, movedKey);

    keys.forEach(key => {
      newResumeData[key] = resumeData[key];
    });

    resumeData = newResumeData;
    saveData();
  };

  const loadData = async () => {
    resumeData = await window.electronAPI.getData();
    render();
  };

  const saveData = async () => {
    await window.electronAPI.saveData(resumeData);
    loadData();
  };

  const openModal = (key = null) => {
    editingKey = key;
    if (key) {
      modalTitle.textContent = '编辑模块';
      modalInputKey.value = key;
      modalInputValue.value = resumeData[key];
    } else {
      modalTitle.textContent = '添加模块';
      modalInputKey.value = '';
      modalInputValue.value = '';
    }
    modal.style.display = 'block';
  };

  const closeModal = () => {
    modal.style.display = 'none';
  };

  modalSaveButton.onclick = () => {
    const newKey = modalInputKey.value.trim();
    const value = modalInputValue.value;

    if (!newKey) {
      alert('模块名称不能为空');
      return;
    }

    if (editingKey) {
      // 如果是编辑现有模块
      if (editingKey !== newKey) {
        // 如果模块名称也改变了，需要保留顺序
        const keys = Object.keys(resumeData);
        const oldIndex = keys.indexOf(editingKey);
        const newResumeData = {};
        keys.splice(oldIndex, 1); // 移除旧键
        keys.splice(oldIndex, 0, newKey); // 在原位置插入新键
        keys.forEach(k => {
          newResumeData[k] = (k === newKey) ? value : resumeData[k];
        });
        resumeData = newResumeData;
      } else {
        // 如果模块名称没变，只更新值
        resumeData[newKey] = value;
      }
    } else {
      // 如果是添加新模块，确保添加到末尾
      resumeData[newKey] = value;
    }
    saveData();
    closeModal();
  };

  closeButton.onclick = closeModal;
  window.onclick = (event) => {
    if (event.target == modal) {
      closeModal();
    }
  };

  const deleteModule = (key) => {
    if (confirm(`您确定要删除 ${key} 吗?`)) {
      delete resumeData[key];
      saveData();
    }
  };

  const copyModule = (key) => {
    const textToCopy = resumeData[key];
    window.electronAPI.copyToClipboard(textToCopy);
    showCopyNotification(`模块 "${key}"`);
  };

  const showCopyNotification = (copiedWhat) => {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = `已复制 ${copiedWhat} 到剪贴板`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  };

  addModuleBtn.onclick = () => openModal();

  toggleOnTopBtn.onclick = async () => {
    const isAlwaysOnTop = await window.electronAPI.toggleAlwaysOnTop();
    toggleOnTopBtn.style.backgroundColor = isAlwaysOnTop ? '#007bff' : '';
  };

  closeBtn.onclick = () => {
    window.electronAPI.closeApp();
  };

  loadData();
});