import type { Translations } from "../types";
import { AppHeaderEnTranslations } from "@/components/Layout/locale/AppHeader.locale";
import { HeaderMenusEnTranslations } from "@/components/Layout/Header/locale/HeaderMenus.locale";
import { BetaBadgeEnTranslations } from "@/components/Layout/MapCommunity/locale/BetaBadge.locale";
import { CommunityTitleEnTranslations } from "@/components/Layout/MapCommunity/locale/CommunityTitle.locale";
import { CommunityToolbarEnTranslations } from "@/components/Layout/MapCommunity/locale/CommunityToolbar.locale";
import { AppFooterEnTranslations } from "@/components/Layout/locale/AppFooter.locale";
import { NotFoundEnTranslations } from "@/pages/locale/NotFound.locale";
import { CarteEnTranslations } from "@/pages/locale/Carte.locale";
import { GetReportsLayerEnTranslations } from "@/features/navigation/layers/locale/GetReportsLayer.locale";
import { AttachmentListEnTranslations } from "@/features/reports/forms/locale/AttachmentList.locale";
import { ConfirmCancelModalEnTranslations } from "@/features/reports/forms/locale/ConfirmCancelModal.locale";
import { ConfirmDeleteReportModalEnTranslations } from "@/features/reports/forms/locale/ConfirmDeleteReportModal.locale";
import { ShareReportModalEnTranslations } from "@/features/reports/locale/ShareReportModal.locale";
import { TableReportDrawerEnTranslations } from "@/features/reports/locale/TableReportDrawer.locale";
import { DrawingFormEnTranslations } from "@/features/reports/forms/locale/DrawingForm.locale";
import { ImportSketchFileEnTranslations } from "@/features/reports/forms/locale/ImportSketchFile.locale";
import { ReportFormEnTranslations } from "@/features/reports/forms/locale/ReportForm.locale";
import { SketchListEnTranslations } from "@/features/reports/forms/locale/SketchList.locale";
import { ThemeComponentEnTranslations } from "@/features/reports/forms/locale/ThemeComponent.locale";
import { ThemeFormEnTranslations } from "@/features/reports/forms/locale/ThemeForm.locale";
import { CenterMessageEnTranslations } from "@/features/reports/locale/CenterMessage.locale";
import { CreateReportEnTranslations } from "@/features/reports/locale/CreateReport.locale";
import { EditReportEnTranslations } from "@/features/reports/locale/EditReport.locale";
import { ReportDrawerEnTranslations } from "@/features/reports/locale/ReportDrawer.locale";
import { ShowReportEnTranslations } from "@/features/reports/locale/ShowReport.locale";
import { ConfirmDeleteShareReportModalEnTranslations } from "@/features/reports/locale/ConfirmDeleteShareReportModal.locale";
import { ReportTrackingEnTranslations } from "@/features/reports/locale/ReportTracking.locale";
import { useGetReportsLayerEnTranslations } from "@/hooks/navigation/layers/locale/useGetReportsLayer.locale";
import { useGetWFSLayerEnTranslations } from "@/hooks/navigation/layers/locale/useGetWFSLayer.locale";
import { useGetWMSLayerEnTranslations } from "@/hooks/navigation/layers/locale/useGetWMSLayer.locale";
import { useGetWMTSLayerEnTranslations } from "@/hooks/navigation/layers/locale/useGetWMTSLayer.locale";
import { useFeatureTypeValidationEnTranslations } from "@/hooks/working-layer/locale/useFeatureTypeValidation.locale";
import { DrawerComponentEnTranslations } from "@/components/locale/DrawerComponent.locale";
import { FilterAndSortReportEnTranslations } from "@/components/locale/FilterAndSortReport.locale";
import { ReportFiltersComponentEnTranslations } from "@/components/locale/ReportFiltersComponent.locale";
import { DrawingControlEnTranslations } from "@/features/navigation/controls/locale/DrawingControl.locale";
import { ToolsControlEnTranslations } from "@/features/navigation/controls/locale/ToolsControl.locale";
import { CatalogControlEnTranslations } from "@/features/navigation/controls/locale/CatalogControl.locale";
import { CenterReportControlEnTranslations } from "@/features/navigation/controls/custom-controls/locale/CenterReportControl.locale";
import { useGetMapControlsEnTranslations } from "@/features/navigation/controls/locale/useGetMapControls.locale";
import { useReportToolsEnTranslations } from "@/hooks/reports/locale/useReportTools.locale";
import { useDeleteReportEnTranslations } from "@/hooks/reports/locale/useDeleteReport.locale";
import { FeatureTypeLayerLegendsEnTranslations } from "@/features/navigation/layers/legends/locale/FeatureTypeLayerLegends.locale";
import { ShowFeatureTypeFormEnTranslations } from "@/features/working-layer/forms/locale/ShowFeatureTypeForm.locale";
import { EditFeatureTypeFormEnTranslations } from "@/features/working-layer/forms/locale/EditFeatureTypeForm.locale";
import { FeatureTypeFormActionsEnTranslations } from "@/features/working-layer/forms/locale/FeatureTypeFormActions.locale";
import { FeatureTypeFormFieldsEnTranslations } from "@/features/working-layer/forms/locale/FeatureTypeFormFields.locale";
import { FeatureTypeFormHeaderEnTranslations } from "@/features/working-layer/forms/locale/FeatureTypeFormHeader.locale";
import { FeatureTypeFormAutomaticEnTranslations } from "@/features/working-layer/forms/locale/FeatureTypeFormAutomatic.locale";
import { ClickableFeaturesModalEnTranslations } from "@/features/working-layer/modal/locale/ClickableFeaturesModal.locale";
import { FormAttachmentsEnTranslations } from "@/features/reports/forms/locale/FormAttachments.locale";
import { WorkingLayerControlEnTranslations } from "@/features/navigation/controls/locale/WorkingLayerControl.locale";
import { WorkingLayerLabelMapEnTranslations } from "@/features/navigation/controls/locale/WorkingLayerLabelMap.locale";
import { MesureLengthControlEnTranslations } from "@/features/navigation/controls/locale/MesureLengthControl.locale";
import { CustomControlsEnTranslations } from "@/features/navigation/controls/custom-controls/locale/index.locale";
import { ContributionListEnTranslations } from "@/features/contributions/locale/ContributionList.locale";
import { ContributionsConfirmResetEnTranslations } from "@/features/contributions/locale/ContributionsConfirmReset.locale";
import { ReviewContributionsEnTranslations } from "@/features/contributions/locale/ReviewContributions.locale";
import { ReviewSelectedObjectsEnTranslations } from "@/features/working-layer/multiple-selection/locale/ReviewSelectedObjects.locale";
import { ConfirmSaveContributionsEnTranslations } from "@/features/contributions/locale/ConfirmSaveContributions.locale";
import { ConfirmMultipleObjectsActionModalEnTranslations } from "@/features/working-layer/forms/locale/ConfirmMultipleObjectsActionModal.locale";
import { ConfirmMultipleDeselectionEnTranslations } from "@/features/navigation/controls/custom-controls/locale/ConfirmMultipleDeselection.locale";
import { ExportMapModalEnTranslations } from "@/features/navigation/controls/custom-controls/locale/ExportMapModal.locale";
import { useOperatorListEnTranslations } from "@/hooks/working-layer/locale/useOperatorList.locale";
import { SearchTableEnTranslations } from "@/features/working-layer/modal/searchObjects/locale/SearchTable.locale";
import { SearchObjectsModalEnTranslations } from "@/features/working-layer/modal/searchObjects/locale/SearchObjectsModal.locale";
import { GroupComponentEnTranslations } from "@/features/working-layer/modal/searchObjects/locale/GroupComponent.locale";
import { ConfirmDeleteObjectModalEnTranslations } from "@/features/working-layer/modal/searchObjects/locale/ConfirmDeleteObjectModal.locale";

export const translations: Translations<"en"> = {
    AppFooter: AppFooterEnTranslations,
    AppHeader: AppHeaderEnTranslations,
    HeaderMenus: HeaderMenusEnTranslations,
    BetaBadge: BetaBadgeEnTranslations,
    CommunityTitle: CommunityTitleEnTranslations,
    CommunityToolbar: CommunityToolbarEnTranslations,
    DrawerComponent: DrawerComponentEnTranslations,
    FilterAndSortReport: FilterAndSortReportEnTranslations,
    ReportFiltersComponent: ReportFiltersComponentEnTranslations,
    NotFound: NotFoundEnTranslations,
    Carte: CarteEnTranslations,
    GetReportsLayer: GetReportsLayerEnTranslations,
    AttachmentList: AttachmentListEnTranslations,
    ConfirmCancelModal: ConfirmCancelModalEnTranslations,
    ConfirmDeleteReportModal: ConfirmDeleteReportModalEnTranslations,
    ShareReportModal: ShareReportModalEnTranslations,
    TableReportDrawer: TableReportDrawerEnTranslations,
    DrawingForm: DrawingFormEnTranslations,
    ImportSketchFile: ImportSketchFileEnTranslations,
    ReportForm: ReportFormEnTranslations,
    SketchList: SketchListEnTranslations,
    ThemeComponent: ThemeComponentEnTranslations,
    ThemeForm: ThemeFormEnTranslations,
    CenterMessage: CenterMessageEnTranslations,
    CreateReport: CreateReportEnTranslations,
    EditReport: EditReportEnTranslations,
    ReportDrawer: ReportDrawerEnTranslations,
    ShowReport: ShowReportEnTranslations,
    ConfirmDeleteShareReportModal: ConfirmDeleteShareReportModalEnTranslations,
    ReportTracking: ReportTrackingEnTranslations,
    useGetReportsLayer: useGetReportsLayerEnTranslations,
    useGetWFSLayer: useGetWFSLayerEnTranslations,
    useGetWMSLayer: useGetWMSLayerEnTranslations,
    useGetWMTSLayer: useGetWMTSLayerEnTranslations,
    useFeatureTypeValidation: useFeatureTypeValidationEnTranslations,
    DrawingControl: DrawingControlEnTranslations,
    ToolsControl: ToolsControlEnTranslations,
    CatalogControl: CatalogControlEnTranslations,
    CenterReportControl: CenterReportControlEnTranslations,
    useGetMapControls: useGetMapControlsEnTranslations,
    useReportTools: useReportToolsEnTranslations,
    useDeleteReport: useDeleteReportEnTranslations,
    FeatureTypeLayerLegends: FeatureTypeLayerLegendsEnTranslations,
    ShowFeatureTypeForm: ShowFeatureTypeFormEnTranslations,
    EditFeatureTypeForm: EditFeatureTypeFormEnTranslations,
    FeatureTypeFormActions: FeatureTypeFormActionsEnTranslations,
    FeatureTypeFormFields: FeatureTypeFormFieldsEnTranslations,
    FeatureTypeFormHeader: FeatureTypeFormHeaderEnTranslations,
    FeatureTypeFormAutomatic: FeatureTypeFormAutomaticEnTranslations,
    ClickableFeaturesModal: ClickableFeaturesModalEnTranslations,
    FormAttachments: FormAttachmentsEnTranslations,
    WorkingLayerControl: WorkingLayerControlEnTranslations,
    WorkingLayerLabelMap: WorkingLayerLabelMapEnTranslations,
    MesureLengthControl: MesureLengthControlEnTranslations,
    CustomControls: CustomControlsEnTranslations,
    ContributionList: ContributionListEnTranslations,
    ContributionsConfirmReset: ContributionsConfirmResetEnTranslations,
    ReviewContributions: ReviewContributionsEnTranslations,
    ReviewSelectedObjects: ReviewSelectedObjectsEnTranslations,
    ConfirmSaveContributions: ConfirmSaveContributionsEnTranslations,
    ConfirmMultipleObjectsActionModal: ConfirmMultipleObjectsActionModalEnTranslations,
    ConfirmMultipleDeselection: ConfirmMultipleDeselectionEnTranslations,
    ExportMapModal: ExportMapModalEnTranslations,
    useOperatorList: useOperatorListEnTranslations,
    SearchTable: SearchTableEnTranslations,
    SearchObjectsModal: SearchObjectsModalEnTranslations,
    GroupComponent: GroupComponentEnTranslations,
    ConfirmDeleteObjectModal: ConfirmDeleteObjectModalEnTranslations,
};
