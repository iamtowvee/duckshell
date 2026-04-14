document.addEventListener('DOMContentLoaded', function() {
    const input = document.querySelector('.code.block.inputer');
    const history = document.querySelector('.code.block.history');
    
    // Массив для хранения истории команд (для ↑/↓ потом)
    const commandHistory = [];
    
    function addToHistory(text, isCommand = true) {
        const line = document.createElement('p');
        line.textContent = text;
        if (isCommand) {
            line.classList.add('command-line');
        }
        history.appendChild(line);
        history.scrollTop = history.scrollHeight;
    }
    
    function deepParseValue(str) {
        const trimmed = str.trim();
        
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return { type: 'string', value: trimmed.slice(1, trimmed.length - 1) };
        } else if (trimmed === '') {
            return { type: 'null', value: null };
        } else if (!isNaN(trimmed)) {
            if (trimmed.includes(".")) {
                return { type: 'float', value: parseFloat(trimmed) };
            } else {
                return { type: 'int', value: parseInt(trimmed) };
            }
        } else {
            switch (trimmed) {
                case 'null':
                    return { type: 'null', value: null };
                case 'true':
                    return { type: 'bool', value: true };
                case 'false':
                    return { type: 'bool', value: false };
                default:
                    return { type: 'unknown', value: trimmed };
            }
        }
    }
    
    function mat(a, b, c) {
        switch (a) {
            case 'add':
                return b + c;
            case 'mul':
                return b * c;
            case 'del':
                return b / c;
            case 'min':
                return b - c;
            case 'pow':
                return b ** c;
            default:
                return 'err';
        }
    }
    
    async function downloadFile(url, filename) {
        try {
            // 1. Качаем файл как Blob (бинарные данные)
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const blob = await response.blob();
            
            // 2. Создаём "виртуальную" ссылку на эти данные
            const blobUrl = URL.createObjectURL(blob);
            
            // 3. Создаём <a>, эмулируем клик, удаляем
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // 4. Освобождаем память
            URL.revokeObjectURL(blobUrl);
            
            return `Downloaded: ${filename}`;
        } catch (error) {
            return `Download failed: ${error.message}`;
        }
    }
    
    function executeCommand(cmd) {
        const args = cmd.trim().split(/\s+/);
        const command = args[0].toLowerCase();
        
        addToHistory(cmd, true); // Показываем введённую команду с $
        
        // Заглушки команд
        if (command === 'help') {
            addToHistory('> Available: help, version, clear, type <args>, typeof <args>', false);
        } else if (command === 'faq') {
            addToHistory('> FAQ', false);
            addToHistory('├─ Personal data', false);
            addToHistory('│  ├─ Q: Is personal data collected?', false);
            addToHistory('│  └─ A: No.', false);
            addToHistory('└─ Price', false);
            addToHistory('⠀⠀⠀├─ Q: Is it free?', false);
            addToHistory('⠀⠀⠀└─ A: Yes, completely.', false);
        } else if (command === 'version') {
            addToHistory('> DuckShell v26.4.1', false);
        } else if (command === 'clear') {
            history.innerHTML = '';
            addToHistory('DuckShell v26.4.1: online console.', false);
            addToHistory('iamtowvee © 2026', false);
            addToHistory('⠀', false);
        } else if (command === 'echo') {
            let tmp = cmd.slice(4).trim();
            addToHistory(`> ${tmp}`, false);
        } else if (command === 'download') {
            const url = args[1];
            const filename = args[2] || 'file.txt';
            
            if (!url) {
                addToHistory('> Usage: download <url> <filename>', false);
            } else {
                addToHistory(`> Downloading ${filename}...`, false);
                downloadFile(url, filename).then(msg => {
                    addToHistory(`> ${msg}`, false);
                });
            }
        } else if (command === 'type') {
            let tmp = cmd.slice(4).trim();
            let result = deepParseValue(tmp);
            addToHistory(`> Result done.`, false);
            addToHistory(`├─ Type: ${result.type}`, false);
            addToHistory(`└─ Value: ${result.value}`, false);
        } else if (command === 'typeof') {
            let tmp = cmd.slice(6).trim();
            let result = deepParseValue(tmp);
            addToHistory(`> ${result.type}`, false);
        } else if (command === 'math') {
            if (cmd.includes(':') && cmd.includes(',')) {
                let expr = cmd.slice(4).trim();
                let fir = expr.split(':').map(f => f.trim());
                let op = fir[0];
                let value = fir[1];
                let sec = value.split(',').map(s => s.trim());
                let aa = Number(sec[0]);
                let bb = Number(sec[1]);
                
                if (!isNaN(aa) && !isNaN(bb)) {
                    switch (op) {
                        case 'add':
                            let resa = mat('add', aa, bb);
                            addToHistory(`> ${resa}`, false);
                            break;
                        case 'mul':
                            let resm = mat('mul', aa, bb);
                            addToHistory(`> ${resm}`, false);
                            break;
                        case 'div':
                            let resd = mat('del', aa, bb);
                            addToHistory(`> ${resd}`, false);
                            break;
                        case 'sub':
                            let ress = mat('min', aa, bb);
                            addToHistory(`> ${ress}`, false);
                            break;
                        case 'pow':
                            let resp = mat('pow', aa, bb);
                            addToHistory(`> ${resp}`, false);
                            break;
                        default:
                            addToHistory('ERROR: Unknown.', false);
                            break;
                    }
                } else if (isNaN(aa)) {
                    addToHistory(`ERROR: Not a number: ${aa}`, false);
                } else if (isNaN(bb)) {
                    addToHistory(`ERROR: Not a number: ${bb}`, false);
                } else {
                    addToHistory('ERROR: Unknown.', false);
                }
            } else {
                addToHistory('Use: math op: a, b', false);
            }
        } else if (command === 'hex') {
            let tmp = cmd.slice(3).trim();
            if (!tmp.includes('.') && !tmp.includes('-') && !isNaN(tmp)) {
                let num = parseInt(tmp);
                let done = num.toString(16);
                addToHistory(`> 0x${done}`, false);
            } else if (isNaN(tmp)) {
                addToHistory(`ERROR: It's not a number.`)
            } else {
                addToHistory(`ERROR: Number can't be float.`)
            }
        } else if (command === 'cex') {
            let tmp = cmd.slice(3).trim();
            if (!tmp.includes('.') && !tmp.includes('-') && !isNaN(tmp)) {
                let num = parseInt(tmp);
                let done = num.toString(16);
                addToHistory(`> ${done}`, false);
            } else if (isNaN(tmp)) {
                addToHistory(`ERROR: It's not a number.`)
            } else {
                addToHistory(`ERROR: Number can't be float.`)
            }
        } else if (command === 'unhex') {
            let tmp = cmd.slice(5).trim();
            if (tmp.startsWith('0x')) {
                tmp = tmp.slice(2).trim();
            }
            
            let num = parseInt(tmp, 16);
            
            if (isNaN(num)) {
                addToHistory(`ERROR: Invalid hex: ${tmp}`, false);
            } else {
                addToHistory(`> ${num}`, false);
            }
        } else if (command === '') {
            // skip
        } else {
            addToHistory(`Unknown command: ${command}`, false);
        }
    }
    
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const cmd = this.value.trim();
            if (cmd) {
                commandHistory.push(cmd);
                executeCommand(cmd);
                this.value = ''; // Очищаем поле
            }
            event.preventDefault();
        }
    });
});