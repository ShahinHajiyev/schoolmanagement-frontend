import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Menu } from 'src/app/interfaces/menu';
import { AuthService } from 'src/app/services/auth.service';
import { SidebarService } from 'src/app/services/sidebar.service';

const ICON_MAP: Record<string, string> = {
  '/dashboard': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  '/course':    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  '/enrollment':`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  '/admin':     `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  '/students':  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  '/schedule':  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  '/grades':    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  '/teacher':   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  '/training':  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
};

const DEFAULT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;

/** All known routes. Shown when backend doesn't return them yet. */
const STATIC_MENU: Menu[] = [
  { id: 0, name: 'Dashboard',  path: '/dashboard'  },
  { id: 0, name: 'Courses',    path: '/course'      },
  { id: 0, name: 'Enrollment', path: '/enrollment'  },
  { id: 0, name: 'Schedule',   path: '/schedule'    },
  { id: 0, name: 'Grades',     path: '/grades'      },
  { id: 0, name: 'Teacher',    path: '/teacher'     },
  { id: 0, name: 'Training',   path: '/training'    },
  { id: 0, name: 'Students',   path: '/students'    },
  { id: 0, name: 'Admin',      path: '/admin'       },
];

/** Routes that are only shown and accessible to admins. */
const ADMIN_ONLY_PATHS = new Set(['/admin', '/students', '/dashboard']);

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  @Output() closeRequest = new EventEmitter<void>();

  menuItems: Menu[] = [];
  loggedUser: string | null = null;
  userInitial = '';
  isAdmin = false;

  private destroy$ = new Subject<void>();

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUserSync();
    this.userInitial = (this.loggedUser?.[0] ?? '?').toUpperCase();
    this.isAdmin = this.authService.isAdmin();

    this.sidebarService.getMenus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          // Merge backend items with static fallbacks, dedup by path
          const backendPaths = new Set(data.map(m => m.path));
          const extras = STATIC_MENU.filter(m => !backendPaths.has(m.path));
          const all = [...data, ...extras];
          this.menuItems = this.isAdmin ? all : all.filter(m => !ADMIN_ONLY_PATHS.has(m.path));
        },
        error: () => {
          const all = STATIC_MENU;
          this.menuItems = this.isAdmin ? all : all.filter(m => !ADMIN_ONLY_PATHS.has(m.path));
        }
      });

    // Auto-close on mobile after navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.closeRequest.emit());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getIcon(path: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(ICON_MAP[path] ?? DEFAULT_ICON);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  trackByPath(_index: number, item: Menu): string {
    return item.path;
  }
}
