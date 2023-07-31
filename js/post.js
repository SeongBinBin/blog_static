const scroller = new Scroller(false) // 스크롤 객체 생성 

window.addEventListener("load", (event) => {
  // 테마변경 (다크모드/ 일반모드)
  const mode = document.querySelector('.mode')
  const icons = mode.querySelectorAll('.fa-solid')
  const header = document.querySelector('header')
  
  const title = document.querySelector('.post-container .post-title input')
  const postContents = document.querySelector('.post-container .post-contents')
  const tagInput = document.querySelector('.post-container .post-tags input')

  mode.addEventListener('click', (event) => {
    document.body.classList.toggle('dark')
    header.classList.toggle('dark')

    title.classList.toggle('dark')
    postContents.classList.toggle('dark')
    tagInput.classList.toggle('dark')
    
    for(const icon of icons){
      icon.classList.contains('active') ? 
        icon.classList.remove('active') 
        : icon.classList.add('active')
    }
  })

  // 태그입력 기능
  const tagList = document.querySelector('.post-container .post-tags ul')
  const tagslimit = 10 // 태그의 갯수 제한
  const tagLength = 10 // 태그 글자수 제한

  tagInput.addEventListener('keyup', function(event){
   console.log('태그 입력중 ...', event.key, tagInput.value)

   const trimTag = this.value.trim() // 글자 양쪽에 공백을 제거
   if(event.key === 'Enter' && trimTag !== '' && trimTag.length <= tagLength && tagList.children.length < tagslimit){
      const tag = document.createElement('li')
      tag.innerHTML = `#${trimTag}<a href="#">x</a>`
      tagList.appendChild(tag)
      // tagList.innerHTML += `<li>#${trimTag.trim()}<a href='#'>x</a></li>`
      this.value = '' // 입력창 초기화
     }
  })

  // 태그삭제 기능 (이벤트 위임)
  tagList.addEventListener('click', function(event){
   console.log(event.target, event.target.parentElement, event.target.hasAttribute('href'))

   event.preventDefault()
   if(event.target.hasAttribute('href')){
      tagList.removeChild(event.target.parentElement)
   }
  })

  // 파일입력 처리
  postContents.focus()  // 첫로딩때 커서 보이기
  postContents.insertAdjacentElement('afterbegin', createNewLine()) // 첫번째 줄에 새로운 공백 라인 추가
  let lastCaretLine = null // Caret : 커서 (커서 위치의 엘리먼트)
  const uploadInput = document.querySelector('.upload input')
  uploadInput.addEventListener('change', function(event){
   const files = this.files
   console.log(files)

   if(files.length > 0){
      for(const file of files){
         const fileType = file.type
         console.log(fileType)

         if(fileType.includes('image')){
            console.log('image')
            const img = buildMediaElement('img', { src: URL.createObjectURL(file)})

            // 편집기의 마지막 커서 위치에 파일 추가
            lastCaretLine = addFileToCurrentLine(lastCaretLine, img)
         }else if(fileType.includes('video')){
            console.log('video')
            const video = buildMediaElement('video', 
            { className: 'video-file',
               controls: true,
               src: URL.createObjectURL(file)
            })

            lastCaretLine = addFileToCurrentLine(lastCaretLine, video)
         }else if(fileType.includes('audio')){
            console.log('audio')
            const audio = buildMediaElement('audio', 
            { className: 'audio-file',
               controls: true,
               src: URL.createObjectURL(file)
            })

            lastCaretLine = addFileToCurrentLine(lastCaretLine, audio)
         }else{
            console.log('file', file.name, file.size)
            const div = document.createElement('div')
            div.className = 'normal-file'
            div.contentEditable = false   // 편집이 되지 않도록 막아둠
            div.innerHTML = `
            <div class='file-icon'>
              <span class="material-icons">folder</span>
            </div>
            <div class='file-info'>
              <h3>${getFileName(file.name, 70)}</h3>
              <p>${getFileSize(file.size)}</p>
            </div>
          `
          lastCaretLine = addFileToCurrentLine(lastCaretLine, div) // 에디터에 파일추가 및 파일이 추가 될때마다 커서위치 업데이트하기
         }            
      }

      // 커서위치를 맨 마지막으로 추가한 파일 아래쪽에 보여주기
      // 사용자가 드래그로 선택한 범위
      const selection = document.getSelection()
      selection.removeAllRanges() 

      //해당 엘리먼트를 범위로 지정
      const range = document.createRange()
      range.selectNodeContents(lastCaretLine)  
      range.collapse() // 범위가 아니라 커서 지정
      selection.addRange(range) // 새로운 범위 설정
      postContents.focus() // 편집기에 커서 보여주기
   }
  })

  postContents.addEventListener('blur', function(event){
   // 편집기가 blur 될때 마지막 커서 위치에 있는 엘리먼트
   lastCaretLine = document.getSelection().anchorNode
   // console.log(lastCaretLine.parentNode, lastCaretLine, lastCaretLine.length)
  })

  // 텍스트 포맷
  const toolBox = document.querySelector('.toolbox')
  const textTool = document.querySelector('.text-tool')
  const colorBoxes = textTool.querySelectorAll('.text-tool .color-box')
  const fontBox = textTool.querySelector('.text-tool .font-box')
  textTool.addEventListener('click', function(event){
   event.stopPropagation()
   console.log(event.target.innerText)
   switch(event.target.innerText){
      case 'format_bold':
         changeTextFormat('bold')
         break
      case 'format_italic':
         changeTextFormat('italic')
         break
      case 'format_underlined':
         changeTextFormat('underline')
         break
      case 'format_strikethrough':
         changeTextFormat('strikeThrough')
         break
      case 'format_color_text':
         // changeTextFormat('foreColor', 'orange')
         hideDropdown(toolBox, 'format_color_text')
         colorBoxes[0].classList.toggle('show')
         break
      case 'format_color_fill':
         // changeTextFormat('backColor', 'black')
         hideDropdown(toolBox, 'format_color_fill')
         colorBoxes[1].classList.toggle('show')
         break
      case 'format_size':
         // changeTextFormat('fontsize', 7)
         hideDropdown(toolBox, 'format_size')
         fontBox.classList.toggle('show')
         break
   }
   // postContents.focus({preventScroll: true})
  })

  const linkTool = document.querySelector('.link-tool')
  const imoticonBox = document.querySelector('.link-tool .imoticon-box')
  linkTool.addEventListener('click', function(event){
    event.stopPropagation() // document 의 click 이벤트와 충돌하지 않도록 함
    console.log(event.target.innerText)
    switch(event.target.innerText){
      case 'sentiment_satisfied':
        hideDropdown(toolBox, 'sentiment_satisfied')
        imoticonBox.classList.toggle('show')
        break 
      case 'table_view':
        break 
      case 'link':
        break 
      case 'format_list_bulleted':
        break 
    }
  })

  colorBoxes[0].addEventListener('click', (event) => changeColor(event, 'foreground'))
  colorBoxes[1].addEventListener('click', (event) => changeColor(event, 'background'))
  fontBox.addEventListener('click', changeFontSize)
  imoticonBox.addEventListener('click', addImoticon)

  // 텍스트 정렬
  const alignTool = document.querySelector('.align-tool')
  alignTool.addEventListener('click', function(event){
   console.log(event.target.innerText)
   switch(event.target.innerText){
      case 'format_align_left':
         changeTextFormat('justifyLeft')
         break
      case 'format_align_center':
         changeTextFormat('justifyCenter')
         break
      case 'format_align_right':
         changeTextFormat('justifyRight')
         break
      case 'format_align_justify':
         changeTextFormat('justifyFull')
         break
   }
  })
})

// 공백라인(공백 엘리먼트) 생성
function createNewLine(){
   const newline = document.createElement('div')
   newline.innerHTML = `<br/>`
   return newline
}

function addFileToCurrentLine(line, file){
   console.log(line.nodeType) // nodeType = 3이면 텍스트 노드

   if(line.nodeType === 3){   // 글자 중간(문장 중간)에 커서를 두고 추가해도 추가될 수 있게함
      line = line.parentNode // div 엘리먼트
   }
   line.insertAdjacentElement('afterend', createNewLine())
   line.nextSibling.insertAdjacentElement('afterbegin', file)
   line.nextSibling.insertAdjacentElement('afterend', createNewLine())
   return line.nextSibling.nextSibling // 파일 하단에 위치한 공백라인
}

function getFileName(name, limit){
   // console.log(name.slice (0, limit))
   // console.log(name.lastIndexOf('.'), name.length)
   return name.length > limit ? `${name.slice(0, limit)}... ${name.slice(name.lastIndexOf('.'), name.length)}` : name
}

function getFileSize(number){
   if(number < 1024){
      return number + 'bytes'
   } else if(number >= 1024 && number < 1048576) {
      return (number / 1024).toFixed(1) + 'KB'
   } else if(number >= 1048576) {
      return (number / 1048576).toFixed(1) + 'MB'
   }
}

// options : { classname : 'audio', controls: 'true'}
function buildMediaElement(tag, options){
   const mediaElement = document.createElement(tag)
   for(const option in options){
      mediaElement[option] = options[option]
   }
   return mediaElement
}

function changeTextFormat(style, param){
   console.log(style)
   document.execCommand(style, false, param)
   // postContents.focus({preventScroll: true})    // 커서 설정
}

function hideDropdown(toolBox, currentDropdown){
   // 현재 text-tool 요소 안쪽에서 열려있는 드롭다운 메뉴를 조회
   const dropdown = toolBox.querySelector('.select-menu-dropdown.show')

   // 현재 보이는 드롭다운 메뉴가 현재 클릭한 드롭다운 메뉴가 아닌 경우
   // 현재 클릭한 드롭다운 메뉴만 토글하고 나머지 메뉴는 화면에서 가린다
   if(dropdown && dropdown.parentElement.querySelector('a span').innerText !== currentDropdown){
      dropdown.classList.remove('show')
   }
}

document.addEventListener('click', function(e){
   // 현재 열려있는 드롭다운 메뉴 조회
   const dropdown = document.querySelector('.select-menu-dropdown.show')

   if(dropdown && !dropdown.contains(e.target)){
      dropdown.classList.remove('show')
   }
})

function changeColor(event, mode){
   event.stopPropagation()    // 상위요소로 클릭이벤트가 버블링되지 않게함
   
   if(!event.target.classList.contains('select-menu-dropdown')){
      console.log(mode, event.target)
      switch(mode){
         case 'foreground':
            changeTextFormat('foreColor', event.target.style.backgroundColor)
            break
         case 'background':
            changeTextFormat('backColor', event.target.style.backgroundColor)
            break
      }
      event.target.parentElement.classList.remove('show')   // 드롭다운 숨기기
   }
}

function changeFontSize(event){
   event.stopPropagation()
   
   if(!event.target.classList.contains('select-menu-dropdown')){
      changeTextFormat('fontsize', event.target.id)
      event.target.parentElement.classList.remove('show')
   }
}

function addImoticon(event){
   event.stopPropagation()
   console.log(event.target)
   if(!event.target.classList.contains('select-menu-dropdown')){
     changeTextFormat('insertText', event.target.innerText) // 아이콘 추가 
     event.target.parentElement.classList.remove('show') // 드롭다운 메뉴 숨기기
   }
 }