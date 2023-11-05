import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaxFormComponent } from './tax-form/tax-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/tax-form', pathMatch: 'full' },
  { path: 'tax-form', component: TaxFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
