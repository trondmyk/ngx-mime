import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { MatDialog, MatDialogConfig, DialogPosition } from '@angular/material';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';

import { ViewerOptions } from '../../core/models/viewer-options';
import { MimeViewerIntl } from './../../core/intl/viewer-intl';
import { Manifest } from './../../core/models/manifest';
import { ContentsDialogComponent } from './../../contents-dialog/contents-dialog.component';
import { ContentsDialogService } from './../../contents-dialog/contents-dialog.service';
import { ContentSearchDialogService } from './../../content-search-dialog/content-search-dialog.service';
import { MimeDomHelper } from '../../core/mime-dom-helper';
import { IiifManifestService } from './../../core/iiif-manifest-service/iiif-manifest-service';
import { FullscreenService } from './../../core/fullscreen-service/fullscreen.service';
import { ViewerLayout } from '../../core/models/viewer-layout';
import { ViewerLayoutService } from '../../core/viewer-layout-service/viewer-layout-service';
import { ManifestUtils } from '../../core/iiif-manifest-service/iiif-manifest-utils';

@Component({
  selector: 'mime-viewer-header',
  templateUrl: './viewer-header.component.html',
  styleUrls: ['./viewer-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [
    trigger('headerState', [
      state('hide', style({
        opacity: 0,
        display: 'none',
        transform: 'translate(0, -100%)'

      })),
      state('show', style({
        opacity: 1,
        display: 'block',
        transform: 'translate(0, 0)'
      })),
      transition('hide => show', animate(ViewerOptions.transitions.toolbarsEaseInTime + 'ms ease-in')),
      transition('show => hide', animate(ViewerOptions.transitions.toolbarsEaseOutTime + 'ms ease-out'))
    ])
  ],
  host: {
    '[@headerState]': 'state'
  }
})
export class ViewerHeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mimeHeaderBefore', {read: ViewContainerRef}) mimeHeaderBefore: ViewContainerRef;
  @ViewChild('mimeHeaderAfter', {read: ViewContainerRef}) mimeHeaderAfter: ViewContainerRef;
  private subscriptions: Array<Subscription> = [];
  public manifest: Manifest;
  public state = 'hide';
  isContentSearchEnabled = false;
  isFullscreenEnabled = false;
  isPagedManifest = false;
  viewerLayout: ViewerLayout;

  ViewerLayout: typeof ViewerLayout = ViewerLayout; // enables parsing of enum in template



  constructor(
    public intl: MimeViewerIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private contentsDialogService: ContentsDialogService,
    private contentSearchDialogService: ContentSearchDialogService,
    private iiifManifestService: IiifManifestService,
    private fullscreenService: FullscreenService,
    private mimeDomHelper: MimeDomHelper,
    private viewerLayoutService: ViewerLayoutService
  ) { }

  ngOnInit() {
    this.isFullscreenEnabled = this.fullscreenService.isEnabled();

    this.subscriptions.push(this.intl.changes.subscribe(() => this.changeDetectorRef.markForCheck()));

    this.subscriptions.push(this.fullscreenService.onChange.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    }));

    this.subscriptions.push(this.iiifManifestService.currentManifest.subscribe((manifest: Manifest) => {
      this.manifest = manifest;
      this.isContentSearchEnabled = manifest.service ? true : false;
      this.isPagedManifest = ManifestUtils.isManifestPaged(manifest);
      this.changeDetectorRef.detectChanges();
    }));

    this.subscriptions.push(this.viewerLayoutService.onChange.subscribe((viewerLayout: ViewerLayout) => {
      this.viewerLayout = viewerLayout;
    }));

  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  public toggleContents() {
    this.contentSearchDialogService.close();
    this.contentsDialogService.toggle();
  }

  public toggleSearch() {
    this.contentsDialogService.close();
    this.contentSearchDialogService.toggle();
  }

  public toggleFullscreen(): void {
    return this.mimeDomHelper.toggleFullscreen();
  }

  public isInFullScreen(): boolean {
    return this.fullscreenService.isFullscreen();
  }

  public setLayoutOnePage(): void {
    this.viewerLayoutService.setLayout(ViewerLayout.ONE_PAGE);
  }

  public setLayoutTwoPage(): void {
    this.viewerLayoutService.setLayout(ViewerLayout.TWO_PAGE);
  }

}
