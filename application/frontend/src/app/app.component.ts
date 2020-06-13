import {Component} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {WsService} from './sandbox/ws.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private wsService: WsService, router: Router) {
    router.events.subscribe(e => {

      // console.log(e);
      if (e instanceof NavigationEnd) {
        console.log('NavigationEnd');
        let jogging = (e.url === '/picture/fov') || (e.url === '/pano/fov') || (e.url === '/tools/jog');
        wsService.jogging.setValue(jogging);
        console.log('SET JOGGING', jogging)
      }
    })
  }

}
