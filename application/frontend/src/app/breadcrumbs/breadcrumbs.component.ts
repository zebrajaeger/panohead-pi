import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {

  breadcrumbs: string;

  constructor(private route: ActivatedRoute, private router: Router) {
    router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        const x = e as NavigationEnd;
        this.breadcrumbs = x.urlAfterRedirects;
      }
    });
  }

  ngOnInit(): void {
  }

}
