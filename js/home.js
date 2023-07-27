const scroller = new Scroller(false) // 스크롤 객체 생성 

window.addEventListener("load", (event) => {
  // 테마변경 (다크모드/ 일반모드)
  const mode = document.querySelector('.mode')
  const icons = mode.querySelectorAll('.fa-solid')
  const header = document.querySelector('header')

  mode.addEventListener('click', (event) => {
    document.body.classList.toggle('dark')
    header.classList.toggle('dark')
    
    for(const icon of icons){
      icon.classList.contains('active') ? 
        icon.classList.remove('active') 
        : icon.classList.add('active')
    }
  })

  // 브라우저 상단으로 스크롤하기
  const arrowUp = document.querySelector('.footer .icons .scroll-up') // 위쪽 화살표 클릭 
  arrowUp.addEventListener('click', (event) => {
    history.pushState({}, "", `#`); // URL 주소 변경 
    scroller.setScrollPosition({top: 0, behavior: 'smooth'})
  })

  const logo = document.querySelector('header .logo') // 로고 클릭 
  logo.addEventListener('click', (event) => {
    event.preventDefault() // 부드러운 스크롤링
    history.pushState({}, "", `#`); // URL 주소 변경 
    scroller.setScrollPosition({top: 0, behavior: 'smooth'}) 
  })

  const sections = document.querySelectorAll('.blog-container > div:not(.follow)')
  const footer = document.querySelector('.footer')

  window.addEventListener('scroll', (event) => {
   // 해당 섹션이 헤더에 가까워지면 애니메이션 적용하기
   sections.forEach(section => {
      // console.log(section, section.getBoundingClientRect().top, header.offsetHeight)

      if(section.getBoundingClientRect().top < header.offsetHeight + 200){
         const blogs = section.querySelectorAll('.blog')
         blogs.forEach(blog => blog.classList.add('show'))
      }

      // 스크롤바가 브라우저 상단에 도달하면 애니메이션 해제하기
      if(scroller.getScrollPosition() < 10){
         const blogs = section.querySelectorAll('.blog') 
         blogs.forEach(blog => blog.classList.remove('show'))
      }
   })

   // 스크롤바를 헤더높이만큼 내린 경우 헤더 하단 그림자 & 푸터 숨기기
   if(scroller.getScrollPosition() > header.offsetHeight){
      header.classList.add('active')
      footer.classList.add('hide')
   }else{
      header.classList.remove('active')
      footer.classList.remove('hide')
   }
  })
})