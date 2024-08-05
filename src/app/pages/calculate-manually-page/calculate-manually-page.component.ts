import { ChangeDetectionStrategy, Component } from '@angular/core';
import {MainPageComponent} from "../../components/main-page/main-page.component";

@Component({
  selector: 'app-calculate-manually-page',
  standalone: true,
  imports: [
    MainPageComponent
  ],
  templateUrl: './calculate-manually-page.component.html',
  styleUrl: './calculate-manually-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalculateManuallyPageComponent {

}
