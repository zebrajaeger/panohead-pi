import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ShotsComponent} from './content/shots/shots.component';
import {MotionComponent} from './content/motion/motion.component';
import {PictureOverlapComponent} from './content/picture/picture-overlap/picture-overlap.component';
import {JoystickComponent} from './content/tools/joystick/joystick.component';
import {FovComponent} from './content/picture/fov/fov.component';
import {CameraComponent} from './content/tools/camera/camera.component';
import {PanoFovComponent} from './content/pano/pano-fov/pano-fov.component';
import {PanoRobotComponent} from './content/pano/pano-robot/pano-robot.component';
import {JoggingComponent} from './content/tools/jogging/jogging.component';
import {ServerComponent} from './content/config/server/server.component';

const routes: Routes = [
  {path: 'picture/fov', component: FovComponent},
  {path: 'picture/overlap', component: PictureOverlapComponent},
  {path: 'shots', component: ShotsComponent},
  {path: 'motion', component: MotionComponent},
  {path: 'pano/fov', component: PanoFovComponent},
  {path: 'pano/robot', component: PanoRobotComponent},
  {path: 'tools/joystick', component: JoystickComponent},
  {path: 'tools/camera', component: CameraComponent},
  {path: 'tools/jog', component: JoggingComponent},
  {path: 'config/server', component: ServerComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
