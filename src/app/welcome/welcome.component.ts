import { Component, OnInit } from '@angular/core';
import { AuthService } from '../servicios/auth.service';
import { ApiRequestService } from '../servicios/api-request.service';
import { ActivatedRoute, Router } from '@angular/router';
import {Location} from '@angular/common'; 

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(
    public auth: AuthService,
    public api: ApiRequestService,
    public router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && params.reload == "true") {
        this.location.replaceState('/')
        window.location.reload();
      }
    });
  }

  ngOnInit() {
    if (!this.auth.hayToken()) {
      this.router.navigate(['login']);
    }
  }

  navegar(url) {
    this.router.navigate([url]);
  }

  levantarFacturador() {
    this.api.get("facturador")
      .then(data => {
        if (data) {
          console.log("Exito");
        }
      })
      .catch(err => this.handleError(err));
  }

  private handleError(error: any): void {
    console.log("Error");
  }

}
