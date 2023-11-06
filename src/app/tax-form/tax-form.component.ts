import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GeoDataService } from '../geo-data.service';
import { distinctUntilChanged, filter, pipe, switchMap } from 'rxjs';

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['./tax-form.component.sass'],
})
export class TaxFormComponent {
  constructionTaxForm: FormGroup = new FormGroup({});
  counties: string[] = this.geoDataService.getCounties();
  institutions: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private geoDataService: GeoDataService
  ) {}

  ngOnInit(): void {
    this.constructionTaxForm = this.formBuilder.group({
      county: [''],
      institution: [''],
      isIndividual: [true],
      payerSSN: [''],
      recipientSSN: [''],
      recipientNameOrBusiness: [''],
      recipientAddress: [''],
      recipientEmail: [''],
    });

    this.constructionTaxForm
      .get('county')
      ?.valueChanges.pipe(
        distinctUntilChanged(),
        filter((county) => county !== ''),
        switchMap((county) =>
          this.geoDataService.getInstitutionsByCounty(county)
        )
      )
      .subscribe((institutions) => {
        this.institutions = institutions;
        this.constructionTaxForm.get('institution')?.setValue('');
      });
  }
}
