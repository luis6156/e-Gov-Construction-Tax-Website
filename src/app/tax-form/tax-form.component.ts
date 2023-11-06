import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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
      county: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      personType: ['individual', [Validators.required]],
      authorizedValue: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      payerSSN: [
        '',
        [
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(13),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      recipientSSN: [
        '',
        [
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(13),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      recipientNameOrBusiness: ['', [Validators.required]],
      recipientAddress: ['', [Validators.required]],
      recipientEmail: ['', [Validators.required, Validators.email]],
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
