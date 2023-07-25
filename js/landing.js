const scroller = new Scroller(false)

window.addEventListener('load', (event) => {
   // 테마변경 (다크모드 / 일반모드)
   const mode = document.querySelector('.mode')
   const header = document.querySelector('header')
   const icons = mode.querySelectorAll('.fa-solid')

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
   const arrowUp = document.querySelector('.footer .icons .scroll-up')
   arrowUp.addEventListener('click', (event) => {
      history.pushState({}, "", '#'); // URL 주소 초기화
      scroller.setScrollPosition({top: 0, behavior: 'smooth'})
  })

  const logo = document.querySelector('header .logo') // 로고 클릭 
  logo.addEventListener('click', (event) => {
      event.preventDefault() // a 태그의 기본적인 동작 제거
      history.pushState({}, "", '#'); // URL 주소 변경 
      scroller.setScrollPosition({top: 0, behavior: 'smooth'}) 
  })

   // 네비게이션 메뉴 클릭시 해당 섹션으로 곧바로 스크롤하기
   const sections = document.querySelectorAll('section:not(.footer)')
   const nav = document.querySelector('.navbar ul')

   // 네비게이션 메뉴 클릭한 경우
   nav.querySelectorAll('li a').forEach(anchor => {
      anchor.addEventListener('click', function (event) {
         const section = this.getAttribute('href') // 네비게이션 메뉴에서 클릭한 섹션
         const offsetToElementFromViewport = 
         document.querySelector(section).getBoundingClientRect().top // 브라우저 상단에서 엘리먼트까지의 거리

         if(!scroller.getScrollState()){ // 스크롤링이 멈춘 경우만 해당 섹션으로 스크롤링
            event.preventDefault() // 부드러운 스크롤링
            history.pushState({}, "", `${section}`) // URL 주소에 #about, #story, #contact과 같은 파라미터 추가해서 URL 변경하기

            const offsetToElementFromDocument = offsetToElementFromViewport + scroller.getScrollPosition() // 문서 상단에서 엘리먼트까지의 거리 
            scroller.setScrollPosition({
               top: offsetToElementFromDocument - header.offsetHeight - 10, // 헤더높이에서 10px 아래 위치로 스크롤링 
          behavior: "smooth"
            })
         }
      })
   })

   let lastScrollLocation = 0
   let sectionToMove, menulink

   // 스크롤링중에 발생하는 이벤트
   window.addEventListener('scroll', (event) => {

      // 스크롤이 끝났는지 아닌지 체크하기
      scroller.isScrollended()
      .then(result => console.log('scroll ended!'))
      .catch(err => console.log('scrolling...'))

      // 스크롤링중에 어느정도 스크롤바를 내리면 헤더에 그림자 적용
      scroller.getScrollPosition() > header.offsetHeight ? 
      header.classList.add('active') 
      : header.classList.remove('active')

      // 스크롤링중에 텍스트 애니메이션 적용하기
      sections.forEach(section => {
         const title = section.querySelector('.content h3')
         const paragraph = section.querySelector('.content p')

         // console.log(section.id, section.getBoundingClientRect().top)

         if(section.getBoundingClientRect().top < header.offsetHeight + 50){
            // 해당 섹션이 헤더에 가까워지면 텍스트 애니메이션 적용하기
            title.classList.add('show')
            paragraph.classList.add('show')

            // 해당 섹션이 헤더에 가까워지면 해당 메뉴에 하이라이트 적용
            // console.log(section.id)
            nav.querySelector('a.active').classList.remove('active')
            nav.querySelector(`a[href="#${section.id}"]`).classList.add('active')
         }

         // 스크롤바가 브라우저 상단에 도달하면 텍스트 애니메이션 해제하기
         if(scroller.getScrollPosition() < 10){
            title.classList.remove('show')
            paragraph.classList.remove('show')
         }
      })

      if(!scroller.getScrollState()){  // 스크롤이 멈춘 경우 (조건문이 없다면 무한루프)
         //현재 화면에 보여주는 섹션에 대한 메뉴의 링크 (a 태그)
         menulink = nav.querySelector('a.active').closest('li')   // 현재 화면에 보이는 섹션에 대한 네비게이션 메뉴

         // 1. 스크롤을 내렸는지 올렸는지 판단하기
         if(scroller.getScrollPosition() > lastScrollLocation){   // 스크롤을 내리는 경우
            lastScrollLocation = scroller.getScrollPosition()  // 최근 스크롤 위치 저장
            sectionToMove = menulink.nextElementSibling?.querySelector('a')   // 다음 메뉴
         }else{   // 스크롤을 올리는 경우
            lastScrollLocation = scroller.getScrollPosition()
            sectionToMove = menulink.previousElementSibling?.querySelector('a')   // 이전 메뉴
         }

         // 스크롤링할때 이전/다음 메뉴를 자바스크립트로 클릭해주기
         if(sectionToMove?.getAttribute('href') !== undefined){   // 이동할 이전/다음 섹션이 존재하는 경우
            sectionToMove.click()   // 이미 작성된 a 태그의 클릭 이벤트에서 처리함
         }
      }
   })

})