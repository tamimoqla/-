document.addEventListener('DOMContentLoaded', () => {
  // Get elements
  const profileBtn = document.getElementById('profileBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const profilePage = document.getElementById('profilePage');
  const settingsPage = document.getElementById('settingsPage');
  const home = document.getElementById('home');
  const searchBox = document.getElementById('searchBox');
  const gradeCards = document.querySelectorAll('.grade-card');
  const subjectToggles = document.querySelectorAll('.subject-toggle');
  const shortcutBtns = document.querySelectorAll('.shortcut-btn');
  const sForm = document.getElementById('suggestionForm');
  const sName = document.getElementById('sName');
  const sType = document.getElementById('sType');
  const sMessage = document.getElementById('sMessage');
  const sFile = document.getElementById('sFile');
  const sResult = document.getElementById('suggestionResult');

  // Profile button - open settings page
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      const settingsPage = document.getElementById('settingsPage');
      home.classList.add('hidden');
      profilePage.classList.add('hidden');
      settingsPage.classList.add('active');
      settingsPage.classList.remove('hidden');
      
      // Open profile section in settings
      setTimeout(() => {
        const profileNavBtn = document.querySelector('[data-section="profile"]');
        if (profileNavBtn) profileNavBtn.click();
      }, 50);
      
      history.pushState({page: 'settings'}, '', '#settings');
    });
  }

  // Logout button - show home, hide profile page
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      profilePage.classList.add('hidden');
      home.classList.remove('hidden');
      alert('تم تسجيل الخروج — مرحبًا بعودتك!');
      history.pushState({page: 'home'}, '', '#home');
    });
  }

  // Handle browser back button
  window.addEventListener('popstate', (e) => {
    const settingsPage = document.getElementById('settingsPage');
    // Handle settings, grade list, grade detail states
    if (e.state && e.state.page === 'settings') {
      home.classList.add('hidden');
      profilePage.classList.add('hidden');
      settingsPage.classList.add('active');
      settingsPage.classList.remove('hidden');
    } else if (e.state && e.state.page === 'gradeList') {
      // open grade list for stageKey
      const stage = e.state.stageKey || 'elementary';
      openGradeList(stage, stage === 'elementary' ? 'المرحلة الابتدائية' : (stage === 'middle' ? 'المرحلة المتوسطة' : 'المرحلة الثانوية'));
    } else if (e.state && e.state.page === 'gradeDetail') {
      // open grade detail for specific grade
      const g = e.state.grade || '';
      openGradeDetail(g);
    } else {
      settingsPage.classList.remove('active');
      settingsPage.classList.add('hidden');
      profilePage.classList.add('hidden');
      // hide grade pages
      const gradeListPage = document.getElementById('gradeListPage');
      const gradeDetailPage = document.getElementById('gradeDetailPage');
      if (gradeListPage) gradeListPage.classList.add('hidden');
      if (gradeDetailPage) gradeDetailPage.classList.add('hidden');
      home.classList.remove('hidden');
    }
  });

  // Search functionality
  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      gradeCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = query === '' || text.includes(query) ? 'block' : 'none';
      });
    });
  }

  // Shortcut buttons - smooth scroll
  shortcutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    });
  });

  // Subject toggles
  subjectToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const body = toggle.parentElement.querySelector('.subject-body');
      if (body) {
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
      }
    });
  });

  // Suggestion form submit
  if (sForm) {
    sForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = sName.value.trim();
      const type = sType.value;
      const message = sMessage.value.trim();
      const fileInput = sFile;
      const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : null;
      const entry = {name, type, message, fileName, date: new Date().toISOString()};
      const list = JSON.parse(localStorage.getItem('suggestions') || '[]');
      list.push(entry);
      localStorage.setItem('suggestions', JSON.stringify(list));
      sResult.textContent = 'شكرًا — تم حفظ رسالتك محليًا.';
      sForm.reset();
      setTimeout(() => sResult.textContent = '', 4000);
    });
  }

// Testimonial carousel rotation - show exactly 3 cards at a time
const carouselTrack = document.getElementById('carouselTrack');
const carouselSlides = document.querySelectorAll('.carousel-slide');
let currentIndex = 0;

function updateCarouselDisplay() {
  carouselSlides.forEach((slide, index) => {
    // Remove any previous state classes
    slide.classList.remove('visible','left','center','right');

    // Calculate which 3 slides to show
    const slideIndex = (index - currentIndex + carouselSlides.length) % carouselSlides.length;

    if (slideIndex < 3) {
      // Mark visible and add position class
      slide.classList.add('visible');
      slide.classList.add(slideIndex === 0 ? 'left' : (slideIndex === 1 ? 'center' : 'right'));

      // Ensure display is flex (in case CSS hasn't applied immediately)
      slide.style.display = 'flex';
    } else {
      // hide non-visible slides
      slide.style.display = 'none';
    }
  });
}

function rotateCarousel() {
  // Rotate right-to-left: decrement index so new card enters from right
  currentIndex = (currentIndex - 1 + carouselSlides.length) % carouselSlides.length;
  updateCarouselDisplay();
}

// Initialize display
updateCarouselDisplay();

// Carousel interval control (start/stop so we can pause on hover and reset on manual nav)
let carouselInterval = null;
function startCarousel() {
  stopCarousel();
  carouselInterval = setInterval(rotateCarousel, 4000);
}
function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

startCarousel();

// wire up manual prev/next controls
const carouselPrevBtn = document.getElementById('carouselPrev');
const carouselNextBtn = document.getElementById('carouselNext');
if (carouselPrevBtn) {
  carouselPrevBtn.addEventListener('click', () => {
    // previous (move left-to-right) - increment index
    currentIndex = (currentIndex + 1) % carouselSlides.length;
    updateCarouselDisplay();
    // restart the auto-rotation timer so transitions stay rhythmic
    startCarousel();
  });
}
if (carouselNextBtn) {
  carouselNextBtn.addEventListener('click', () => {
    // next (move right-to-left) - same as rotateCarousel
    rotateCarousel();
    startCarousel();
  });
}

// --- Apply loaded settings to UI (theme, playback, etc.) ---
function applyLoadedSettings() {
  try {
    // Learning settings - dark mode
    const learning = JSON.parse(localStorage.getItem('settings_learning') || '{}');
    if (learning.hasOwnProperty('darkMode') && learning.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    // playback speed (if media elements exist)
    if (learning && learning.hasOwnProperty('defaultSpeed')) {
      const vids = document.querySelectorAll('video');
      vids.forEach(v => v.playbackRate = parseFloat(learning.defaultSpeed) || 1);
    }
  } catch (e) {
    console.error('applyLoadedSettings error', e);
  }
}

// Apply settings on load
applyLoadedSettings();

// Make dark mode toggle apply immediately and save
const darkModeCheckbox = document.getElementById('darkMode');
if (darkModeCheckbox) {
  darkModeCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    // Save learning settings quickly (merge)
    const saved = JSON.parse(localStorage.getItem('settings_learning') || '{}');
    saved.darkMode = e.target.checked;
    localStorage.setItem('settings_learning', JSON.stringify(saved));
  });
}

// Auto-save settings on change for most sections (profile, notifications, language, learning, privacy)
function debounce(fn, wait){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this,args), wait);
  };
}

['profile','notifications','language','learning','privacy'].forEach(section => {
  const panel = document.getElementById(section);
  if (!panel) return;
  // handle inputs/selects/checkboxes
  const inputs = panel.querySelectorAll('input,select,textarea');
  inputs.forEach(input => {
    const tag = input.tagName.toLowerCase();
    const type = input.type;
    if (tag === 'input' && (type === 'checkbox' || type === 'radio' || type === 'select-one')) {
      input.addEventListener('change', () => saveSettings(section));
    } else if (tag === 'select') {
      input.addEventListener('change', () => saveSettings(section));
    } else if (tag === 'input' || tag === 'textarea') {
      // debounce text inputs
      input.addEventListener('input', debounce(() => saveSettings(section), 800));
    }
  });
});

// Fix header shortcut buttons to scroll to sections
const headerShortcuts = document.querySelectorAll('.shortcuts button');
headerShortcuts.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    const el = document.getElementById(target);
    if (el) {
      // ensure hidden pages are shown home first
      document.getElementById('home').classList.remove('hidden');
      document.querySelectorAll('.profile-page, .settings-page, #gradeListPage, #gradeDetailPage').forEach(p => p.classList.add('hidden'));
      setTimeout(() => el.scrollIntoView({behavior: 'smooth', block: 'start'}), 80);
    }
  });
});

// Grade navigation data and handlers
const gradesData = {
  elementary: ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'],
  middle: ['المتوسط الأول', 'المتوسط الثاني', 'المتوسط الثالث'],
  high: ['الثانوي الأول', 'الثانوي الثاني', 'الثانوي الثالث']
};

const btnElementary = document.getElementById('btnElementary');
const btnMiddle = document.getElementById('btnMiddle');
const btnHigh = document.getElementById('btnHigh');
const gradeListPage = document.getElementById('gradeListPage');
const gradeList = document.getElementById('gradeList');
const gradeListTitle = document.getElementById('gradeListTitle');
const gradeDetailPage = document.getElementById('gradeDetailPage');
const gradeDetailTitle = document.getElementById('gradeDetailTitle');
const gradesBackBtn = document.getElementById('gradesBackBtn');
const gradeDetailBackBtn = document.getElementById('gradeDetailBackBtn');
const term1Btn = document.getElementById('term1Btn');
const term2Btn = document.getElementById('term2Btn');
const subjectList = document.getElementById('subjectList');

function openGradeList(stageKey, stageLabel) {
  // hide main home and show grade list page
  document.getElementById('home').classList.add('hidden');
  gradeDetailPage.classList.add('hidden');
  gradeListPage.classList.remove('hidden');
  gradeListTitle.textContent = stageLabel || 'الصفوف';
  gradeList.className = 'grade-list';
  gradeList.innerHTML = '';
  const list = gradesData[stageKey] || [];
  list.forEach((g, idx) => {
    const card = document.createElement('div');
    card.className = 'grade-list-card';
    // Choose an image seed based on stage
    let seed = stageKey === 'elementary' ? 'kids' : (stageKey === 'middle' ? 'teenagers' : 'students');
    card.innerHTML = `<img src="https://picsum.photos/seed/${seed}${idx}/600/300" alt="${g}" />
      <div class="card-body"><h3>${g}</h3><p class="muted">اضغط للدخول إلى الصف</p></div>`;
    card.addEventListener('click', () => openGradeDetail(g));
    gradeList.appendChild(card);
  });
  // push history state so back button works
  history.pushState({page: 'gradeList', stageKey}, '', '#grades/' + stageKey);
}

function openGradeDetail(gradeName) {
  gradeListPage.classList.add('hidden');
  gradeDetailPage.classList.remove('hidden');
  gradeDetailTitle.textContent = gradeName;
  subjectList.innerHTML = '';
  // push history state so back button works
  history.pushState({page: 'gradeDetail', grade: gradeName}, '', '#grade/' + encodeURIComponent(gradeName));
}

if (btnElementary) btnElementary.addEventListener('click', () => openGradeList('elementary', 'المرحلة الابتدائية'));
if (btnMiddle) btnMiddle.addEventListener('click', () => openGradeList('middle', 'المرحلة المتوسطة'));
if (btnHigh) btnHigh.addEventListener('click', () => openGradeList('high', 'المرحلة الثانوية'));

if (gradesBackBtn) gradesBackBtn.addEventListener('click', () => { gradeListPage.classList.add('hidden'); document.getElementById('home').classList.remove('hidden'); });
if (gradeDetailBackBtn) gradeDetailBackBtn.addEventListener('click', () => { gradeDetailPage.classList.add('hidden'); gradeListPage.classList.remove('hidden'); });

// When user chooses a term, show subjects for that grade
function showSubjectsForTerm(gradeName, termKey) {
  // full subject lists for grades (example content)
  const subjectsByGrade = {
    'الصف الأول': ['الرياضيات','اللغة العربية','العلوم','التربية الاسلامية','التربية الفنية','اللغة الإنجليزية'],
    'الصف الثاني': ['الرياضيات','اللغة العربية','العلوم','التربية الاسلامية','التربية الفنية','اللغة الإنجليزية'],
    'الصف الثالث': ['الرياضيات','اللغة العربية','العلوم','التربية الاسلامية','التاريخ','اللغة الإنجليزية'],
    'الصف الرابع': ['الرياضيات','اللغة العربية','العلوم','الجغرافيا','التربية الفنية','اللغة الإنجليزية'],
    'الصف الخامس': ['الرياضيات','اللغة العربية','العلوم','التاريخ','التربية الفنية','اللغة الإنجليزية'],
    'الصف السادس': ['الرياضيات','اللغة العربية','العلوم','الجغرافيا','اللغة الإنجليزية','الحاسب الآلي'],
    'المتوسط الأول': ['الرياضيات','اللغة العربية','العلوم','اللغة الإنجليزية','التربية الاسلامية','الرياضة'],
    'المتوسط الثاني': ['الرياضيات','اللغة العربية','العلوم','اللغة الإنجليزية','التاريخ','الحاسب الآلي'],
    'المتوسط الثالث': ['الرياضيات','اللغة العربية','العلوم','اللغة الإنجليزية','الفيزياء التمهيدية','الكيمياء التمهيدية'],
    'الثانوي الأول': ['الرياضيات','الفيزياء','الكيمياء','الأحياء','اللغة الإنجليزية','الحاسب الآلي'],
    'الثانوي الثاني': ['التخصصات: رياضيات/فيزياء/كيمياء/أحياء بحسب المسار','اللغة الإنجليزية','الحاسب الآلي','التربية الاسلامية'],
    'الثانوي الثالث': ['التحضيرية للجامعة بحسب المسار','مشروعات ومسارات مهنية','اللغة الإنجليزية المتقدمة','الحاسب الآلي']
  };

  const subs = subjectsByGrade[gradeName] || ['الرياضيات','اللغة العربية','العلوم','التاريخ'];
  subjectList.innerHTML = '';
  subs.forEach(s => {
    const card = document.createElement('div');
    card.style.background = 'var(--card)';
    card.style.padding = '10px';
    card.style.borderRadius = '8px';
    card.style.marginBottom = '8px';
    card.style.boxShadow = '0 6px 18px rgba(2,6,23,0.04)';
    card.textContent = s;
    subjectList.appendChild(card);
  });
}

if (term1Btn) term1Btn.addEventListener('click', () => showSubjectsForTerm(gradeDetailTitle.textContent, 'term1'));
if (term2Btn) term2Btn.addEventListener('click', () => showSubjectsForTerm(gradeDetailTitle.textContent, 'term2'));

  // Settings navigation
  const settingsNavItems = document.querySelectorAll('.settings-nav-item');
  const settingsPanels = document.querySelectorAll('.settings-panel');

  settingsNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      
      // Remove active class from all nav items and panels
      settingsNavItems.forEach(nav => nav.classList.remove('active'));
      settingsPanels.forEach(panel => panel.classList.remove('active'));
      
      // Add active class to clicked item and corresponding panel
      item.classList.add('active');
      const targetPanel = document.getElementById(section);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
      
      // Save user preference
      localStorage.setItem('lastSettingsSection', section);
    });
  });

  // Restore last visited settings section
  const lastSection = localStorage.getItem('lastSettingsSection') || 'profile';
  const defaultNavItem = document.querySelector(`[data-section="${lastSection}"]`);
  if (defaultNavItem) {
    defaultNavItem.click();
  }

  // Profile picture upload
  const profilePicInput = document.getElementById('profilePicInput');
  const profilePicPreview = document.getElementById('profilePicPreview');
  
  if (profilePicInput) {
    profilePicInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          profilePicPreview.src = event.target.result;
          localStorage.setItem('userProfilePic', event.target.result);
        };
        reader.onloadend = (event) => {
          // also set header profile button image if available
          try {
            if (profileBtn) {
              profileBtn.style.backgroundImage = `url(${event.target.result})`;
              profileBtn.classList.add('img');
              profileBtn.textContent = '';
            }
          } catch (e) { /* ignore */ }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Load saved profile picture
  const savedPic = localStorage.getItem('userProfilePic');
  if (savedPic && profilePicPreview) {
    profilePicPreview.src = savedPic;
    // apply to header profile button too
    if (profileBtn) {
      profileBtn.style.backgroundImage = `url(${savedPic})`;
      profileBtn.classList.add('img');
      profileBtn.textContent = '';
    }
  }

  // Save settings function
  window.saveSettings = function(section) {
    const settings = {};
    
    if (section === 'profile') {
      settings.fullName = document.getElementById('fullName').value;
      settings.email = document.getElementById('email').value;
      settings.username = document.getElementById('username').value;
      settings.phone = document.getElementById('phone').value;
      settings.bio = document.getElementById('bio').value;
    } else if (section === 'security') {
      const pwd = document.getElementById('newPassword').value;
      const confirm = document.getElementById('confirmPassword').value;
      if (pwd && pwd === confirm) {
        settings.password = pwd;
        alert('تم تحديث كلمة المرور بنجاح!');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
      } else {
        alert('كلمات المرور غير متطابقة!');
        return;
      }
    } else if (section === 'notifications') {
      settings.emailCourseUpdates = document.getElementById('emailCourseUpdates').checked;
      settings.emailGrades = document.getElementById('emailGrades').checked;
      settings.emailMessages = document.getElementById('emailMessages').checked;
      settings.emailPromo = document.getElementById('emailPromo').checked;
      settings.pushNotifications = document.getElementById('pushNotifications').checked;
      settings.soundNotifications = document.getElementById('soundNotifications').checked;
      settings.vibration = document.getElementById('vibration').checked;
    } else if (section === 'language') {
      settings.language = document.getElementById('language').value;
      settings.timezone = document.getElementById('timezone').value;
      settings.dateFormat = document.getElementById('dateFormat').value;
      settings.autoTranslate = document.getElementById('autoTranslate').checked;
    } else if (section === 'learning') {
      settings.videoQuality = document.getElementById('videoQuality').value;
      settings.autoPlayNext = document.getElementById('autoPlayNext').checked;
      settings.subtitles = document.getElementById('subtitles').checked;
      settings.subtitleLanguage = document.getElementById('subtitleLanguage').value;
      settings.playbackSpeed = document.getElementById('playbackSpeed').checked;
      settings.defaultSpeed = document.getElementById('defaultSpeed').value;
      settings.darkMode = document.getElementById('darkMode').checked;
    } else if (section === 'privacy') {
      settings.allowAnyoneMessage = document.getElementById('allowAnyoneMessage').checked;
      settings.allowTeachersOnly = document.getElementById('allowTeachersOnly').checked;
      settings.blockMessages = document.getElementById('blockMessages').checked;
      settings.showOnlineStatus = document.getElementById('showOnlineStatus').checked;
      settings.showLastSeen = document.getElementById('showLastSeen').checked;
      settings.publicProfile = document.getElementById('publicProfile').checked;
      settings.showProgress = document.getElementById('showProgress').checked;
    }
    
    localStorage.setItem(`settings_${section}`, JSON.stringify(settings));
    alert('تم حفظ الإعدادات بنجاح!');
    // If learning section changed, apply immediately
    if (section === 'learning') applyLoadedSettings();
  };

  // Load saved settings
  function loadSettings(section) {
    const saved = localStorage.getItem(`settings_${section}`);
    if (!saved) return;
    
    const settings = JSON.parse(saved);
    
    if (section === 'profile') {
      if (settings.fullName) document.getElementById('fullName').value = settings.fullName;
      if (settings.email) document.getElementById('email').value = settings.email;
      if (settings.username) document.getElementById('username').value = settings.username;
      if (settings.phone) document.getElementById('phone').value = settings.phone;
      if (settings.bio) document.getElementById('bio').value = settings.bio;
    } else if (section === 'notifications') {
      if (settings.hasOwnProperty('emailCourseUpdates')) document.getElementById('emailCourseUpdates').checked = settings.emailCourseUpdates;
      if (settings.hasOwnProperty('emailGrades')) document.getElementById('emailGrades').checked = settings.emailGrades;
      if (settings.hasOwnProperty('emailMessages')) document.getElementById('emailMessages').checked = settings.emailMessages;
      if (settings.hasOwnProperty('emailPromo')) document.getElementById('emailPromo').checked = settings.emailPromo;
      if (settings.hasOwnProperty('pushNotifications')) document.getElementById('pushNotifications').checked = settings.pushNotifications;
      if (settings.hasOwnProperty('soundNotifications')) document.getElementById('soundNotifications').checked = settings.soundNotifications;
      if (settings.hasOwnProperty('vibration')) document.getElementById('vibration').checked = settings.vibration;
    } else if (section === 'language') {
      if (settings.language) document.getElementById('language').value = settings.language;
      if (settings.timezone) document.getElementById('timezone').value = settings.timezone;
      if (settings.dateFormat) document.getElementById('dateFormat').value = settings.dateFormat;
      if (settings.hasOwnProperty('autoTranslate')) document.getElementById('autoTranslate').checked = settings.autoTranslate;
    } else if (section === 'learning') {
      if (settings.videoQuality) document.getElementById('videoQuality').value = settings.videoQuality;
      if (settings.hasOwnProperty('autoPlayNext')) document.getElementById('autoPlayNext').checked = settings.autoPlayNext;
      if (settings.hasOwnProperty('subtitles')) document.getElementById('subtitles').checked = settings.subtitles;
      if (settings.subtitleLanguage) document.getElementById('subtitleLanguage').value = settings.subtitleLanguage;
      if (settings.hasOwnProperty('playbackSpeed')) document.getElementById('playbackSpeed').checked = settings.playbackSpeed;
      if (settings.defaultSpeed) document.getElementById('defaultSpeed').value = settings.defaultSpeed;
      if (settings.hasOwnProperty('darkMode')) document.getElementById('darkMode').checked = settings.darkMode;
    } else if (section === 'privacy') {
      if (settings.hasOwnProperty('allowAnyoneMessage')) document.getElementById('allowAnyoneMessage').checked = settings.allowAnyoneMessage;
      if (settings.hasOwnProperty('allowTeachersOnly')) document.getElementById('allowTeachersOnly').checked = settings.allowTeachersOnly;
      if (settings.hasOwnProperty('blockMessages')) document.getElementById('blockMessages').checked = settings.blockMessages;
      if (settings.hasOwnProperty('showOnlineStatus')) document.getElementById('showOnlineStatus').checked = settings.showOnlineStatus;
      if (settings.hasOwnProperty('showLastSeen')) document.getElementById('showLastSeen').checked = settings.showLastSeen;
      if (settings.hasOwnProperty('publicProfile')) document.getElementById('publicProfile').checked = settings.publicProfile;
      if (settings.hasOwnProperty('showProgress')) document.getElementById('showProgress').checked = settings.showProgress;
    }
  }

  // Load all settings on page load
  ['profile', 'notifications', 'language', 'learning', 'privacy', 'security', 'billing'].forEach(section => {
    loadSettings(section);
  });

  // Helper functions for settings actions
  window.removeDevice = function(button) {
    if (confirm('هل أنت متأكد من حذف هذا الجهاز؟')) {
      button.parentElement.remove();
      alert('تم حذف الجهاز بنجاح!');
    }
  };

  window.editPaymentMethod = function(button) {
    alert('ميزة تعديل طرق الدفع قيد الإنشاء');
  };

  window.removePaymentMethod = function(button) {
    if (confirm('هل أنت متأكد من حذف هذه الطريقة؟')) {
      button.parentElement.remove();
      alert('تم حذف طريقة الدفع بنجاح!');
    }
  };

  window.addPaymentMethod = function() {
    alert('ميزة إضافة طرق دفع جديدة قيد الإنشاء');
  };

  window.downloadInvoice = function() {
    alert('تحميل الفواتير قيد الإنشاء');
  };

  // Open settings page from account menu
  window.openSettings = function(section) {
    const home = document.getElementById('home');
    const profilePage = document.getElementById('profilePage');
    const settingsPage = document.getElementById('settingsPage');
    
    home.classList.add('hidden');
    profilePage.classList.add('hidden');
    settingsPage.classList.remove('hidden');
    
    // Switch to the requested section
    const navItem = document.querySelector(`[data-section="${section}"]`);
    if (navItem) {
      navItem.click();
    }
    
    history.pushState({page: 'settings'}, '', '#settings');
  };

  // Handle settings page close/back
  window.addEventListener('popstate', (e) => {
    const settingsPage = document.getElementById('settingsPage');
    if (settingsPage.classList.contains('active') === false) {
      settingsPage.classList.add('hidden');
    }
  });
});
