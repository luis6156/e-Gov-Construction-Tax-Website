import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeoDataService } from '../geo-data.service';
import { distinctUntilChanged, filter, pipe, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import font from '../../assets/fonts/arial-unicode-ms-normal';

interface TaxResult {
  total: number;
}

interface ValidateResult {
  message: string;
}

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['./tax-form.component.sass'],
})
export class TaxFormComponent {
  constructionTaxForm: FormGroup = new FormGroup({});
  counties: string[] = this.geoDataService.getCounties();
  institutions: string[] = [];
  totalToPay: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private geoDataService: GeoDataService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.constructionTaxForm = this.formBuilder.group({
      county: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      personType: ['individual', [Validators.required]],
      taxType: ['', [Validators.required]],
      authorizedValue: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[0-9]*.[0-9]*$'),
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

    this.constructionTaxForm
      .get('taxType')
      ?.valueChanges.subscribe((newTaxType) => {
        this.constructionTaxForm.get('authorizedValue')?.setValue(0);
      });

    this.constructionTaxForm
      .get('authorizedValue')
      ?.valueChanges.pipe(
        distinctUntilChanged(),
        filter((authorizedValue) => authorizedValue !== ''),
        switchMap((authorizedValue) => {
          const headers = { 'Content-Type': 'application/json' };
          const body = {
            type: this.constructionTaxForm.get('taxType')?.value,
            value: authorizedValue,
          };

          return this.http.post<TaxResult>(
            'http://localhost:3000/api/total',
            body,
            {
              headers,
            }
          );
        })
      )
      .subscribe((result: TaxResult) => {
        console.log(result);
        this.totalToPay = result.total;
      });
  }

  submitForm() {
    console.log(this.constructionTaxForm.value);

    this.http
      .post<ValidateResult>('http://localhost:3000/api/submit', {
        form: {
          totalToPay: this.totalToPay,
          ...this.constructionTaxForm.value,
        },
      })
      .subscribe((result) => {
        if (result['message'] === 'Valid') {
          this.generatePDF();
        } else {
          alert('Invalid total');
        }
      });
  }

  private generatePDF() {
    const doc = new jsPDF();

    doc.addFileToVFS('arial-unicode-ms.ttf', font);
    doc.addFont('arial-unicode-ms.ttf', 'arial-unicode-ms', 'normal');

    doc.setFont('arial-unicode-ms');

    doc.text(
      'Plată a taxei pentru eliberarea autorizației de construcție',
      10,
      10
    );

    console.log(doc.getFontList());

    const formData = this.constructionTaxForm.value;

    const keyToLabel = {
      county: 'Județ',
      institution: 'Instituție',
      taxType: 'Tip taxă',
      personType: 'Tip persoană',
      payerSSN: 'CNP plătitor',
      recipientSSN: 'CNP beneficiar',
      recipientNameOrBusiness: 'Nume sau denumire firmă a beneficiarului',
      recipientAddress: 'Adresă beneficiar',
      recipientEmail: 'Email beneficiar',
    };

    let yPos = 30;
    for (const key of Object.keys(formData)) {
      let value;
      const mappedKey = key as keyof typeof keyToLabel;

      if (key === 'county') {
        value = this.counties[formData[key]];
      } else if (key === 'authorizedValue') {
        doc.text(`Total plătit: ${this.totalToPay}`, 10, yPos);
        yPos += 10;
        continue;
      } else {
        value = formData[key];
      }

      doc.text(`${keyToLabel[mappedKey]}: ${value}`, 10, yPos);
      yPos += 10;
    }

    // Save or open the PDF
    doc.save('tax_form.pdf');
  }
}
