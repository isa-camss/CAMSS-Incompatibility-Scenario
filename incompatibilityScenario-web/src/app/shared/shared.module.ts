// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// Common 3rd party module used accross the app
import { TranslateModule } from "@ngx-translate/core";

// eUI specific modules - commonly used accross the app - prefered way
// keep here to avoid imports within features modules
import { EuiPageModule } from "@eui/components/eui-page";
import { EuiIconModule } from "@eui/components/eui-icon";
import { EuiButtonModule } from "@eui/components/eui-button";
import { EuiButtonGroupModule } from "@eui/components/eui-button-group";
import { EuiInputTextModule } from "@eui/components/eui-input-text";
import { EuiFileUploadModule } from "@eui/components/eui-file-upload";
import { EuiInputCheckboxModule } from "@eui/components/eui-input-checkbox";
import { EuiTabsModule } from "@eui/components/eui-tabs";
import { EuiCardModule } from "@eui/components/eui-card";
import { EuiTableModule } from "@eui/components/eui-table";
import { EuiMessageBoxModule } from "@eui/components/eui-message-box";
import { EuiDialogModule } from "@eui/components/eui-dialog";
import { EuiAlertModule } from "@eui/components/eui-alert";
import { EuiProgressBarModule } from "@eui/components/eui-progress-bar";
import { EuiBadgeModule } from "@eui/components/eui-badge";
import { EuiFeedbackMessageModule } from "@eui/components/eui-feedback-message";
import { EuiDropdownModule } from "@eui/components/eui-dropdown";
import { EuiTooltipDirectiveModule } from "@eui/components/directives";
import { EuiTextAreaModule } from "@eui/components/eui-textarea";
import { EuiSidebarMenuModule } from "@eui/components/eui-sidebar-menu";
import { ProgressBarComponent } from "./progress-bar/progress-bar.component";

// import ALL eUI components
// import { EuiAllModule } from '@eui/components';

const MODULES = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TranslateModule,

    // put here commonly used eUI modules components throughout the application
    EuiPageModule,
    EuiIconModule,
    EuiButtonModule,
    EuiButtonGroupModule,
    EuiInputTextModule,
    EuiFileUploadModule,
    EuiInputCheckboxModule,
    EuiTabsModule,
    EuiCardModule,
    EuiTableModule,
    EuiMessageBoxModule,
    EuiDialogModule,
    EuiAlertModule,
    EuiDialogModule,
    EuiProgressBarModule,
    EuiBadgeModule,
    EuiFeedbackMessageModule,
    EuiDropdownModule,
    EuiTooltipDirectiveModule,
    EuiTextAreaModule,
    EuiSidebarMenuModule,

    // in case of you really want to import all eUI components, see commented imports above
    // EuiAllModule,
];

@NgModule({
    imports: [...MODULES],
    declarations: [ProgressBarComponent],
    exports: [...MODULES, ProgressBarComponent],
})
export class SharedModule {}
