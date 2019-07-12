import 'rxjs/add/operator/takeUntil';

import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export class AutoUnsubscribe implements OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}
