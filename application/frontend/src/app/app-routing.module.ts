import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ShotsComponent} from './content/shots/shots.component';
import {MotionComponent} from './content/motion/motion.component';
import {PictureOverlapComponent} from './content/picture/picture-overlap/picture-overlap.component';

const routes: Routes = [
  {path: 'picture/overlap', component: PictureOverlapComponent},
  {path: 'shots', component: ShotsComponent},
  {path: 'motion', component: MotionComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
