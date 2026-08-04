import type { Translations } from "../types";
import { AppHeaderFrTranslations } from "@/components/Layout/locale/AppHeader.locale";
import { HeaderMenusFrTranslations } from "@/components/Layout/Header/locale/HeaderMenus.locale";
import { BetaBadgeFrTranslations } from "@/components/Layout/MapCommunity/locale/BetaBadge.locale";
import { CommunityTitleFrTranslations } from "@/components/Layout/MapCommunity/locale/CommunityTitle.locale";
import { CommunityToolbarFrTranslations } from "@/components/Layout/MapCommunity/locale/CommunityToolbar.locale";
import { AppFooterFrTranslations } from "@/components/Layout/locale/AppFooter.locale";
import { NotFoundFrTranslations } from "@/pages/locale/NotFound.locale";
import { CarteFrTranslations } from "@/pages/locale/Carte.locale";
import { GetReportsLayerFrTranslations } from "@/features/navigation/layers/locale/GetReportsLayer.locale";
import { AttachmentListFrTranslations } from "@/features/reports/forms/locale/AttachmentList.locale";
import { ConfirmCancelModalFrTranslations } from "@/features/reports/forms/locale/ConfirmCancelModal.locale";
import { ConfirmDeleteReportModalFrTranslations } from "@/features/reports/forms/locale/ConfirmDeleteReportModal.locale";
import { ShareReportModalFrTranslations } from "@/features/reports/locale/ShareReportModal.locale";
import { TableReportDrawerFrTranslations } from "@/features/reports/locale/TableReportDrawer.locale";
import { DrawingFormFrTranslations } from "@/features/reports/forms/locale/DrawingForm.locale";
import { ImportSketchFileFrTranslations } from "@/features/reports/forms/locale/ImportSketchFile.locale";
import { ReportFormFrTranslations } from "@/features/reports/forms/locale/ReportForm.locale";
import { SketchListFrTranslations } from "@/features/reports/forms/locale/SketchList.locale";
import { ThemeComponentFrTranslations } from "@/features/reports/forms/locale/ThemeComponent.locale";
import { ThemeFormFrTranslations } from "@/features/reports/forms/locale/ThemeForm.locale";
import { CenterMessageFrTranslations } from "@/features/reports/locale/CenterMessage.locale";
import { CreateReportFrTranslations } from "@/features/reports/locale/CreateReport.locale";
import { DeleteShareReportComponentFrTranslations } from "@/features/reports/locale/DeleteShareReportComponent.locale";
import { EditReportFrTranslations } from "@/features/reports/locale/EditReport.locale";
import { ReportDrawerFrTranslations } from "@/features/reports/locale/ReportDrawer.locale";
import { ShowReportFrTranslations } from "@/features/reports/locale/ShowReport.locale";
import { ConfirmDeleteShareReportModalFrTranslations } from "@/features/reports/locale/ConfirmDeleteShareReportModal.locale";
import { ReportTrackingFrTranslations } from "@/features/reports/locale/ReportTracking.locale";
import { useGetReportsLayerFrTranslations } from "@/hooks/navigation/layers/locale/useGetReportsLayer.locale";
import { useGetWFSLayerFrTranslations } from "@/hooks/navigation/layers/locale/useGetWFSLayer.locale";
import { useGetWMSLayerFrTranslations } from "@/hooks/navigation/layers/locale/useGetWMSLayer.locale";
import { useGetWMTSLayerFrTranslations } from "@/hooks/navigation/layers/locale/useGetWMTSLayer.locale";
import { useGetInteractionsFuncsFrTranslations } from "@/hooks/navigation/controls/locale/useGetInteractionsFuncs.locale";
import { useFeatureTypeValidationFrTranslations } from "@/hooks/working-layer/locale/useFeatureTypeValidation.locale";
import { DrawerComponentFrTranslations } from "@/components/locale/DrawerComponent.locale";
import { FilterAndSortReportFrTranslations } from "@/components/locale/FilterAndSortReport.locale";
import { ReportFiltersComponentFrTranslations } from "@/components/locale/ReportFiltersComponent.locale";
import { DrawingControlFrTranslations } from "@/features/navigation/controls/locale/DrawingControl.locale";
import { ToolsControlFrTranslations } from "@/features/navigation/controls/locale/ToolsControl.locale";
import { CatalogControlFrTranslations } from "@/features/navigation/controls/locale/CatalogControl.locale";
import { CenterReportControlFrTranslations } from "@/features/navigation/controls/custom-controls/locale/CenterReportControl.locale";
import { useGetMapControlsFrTranslations } from "@/features/navigation/controls/locale/useGetMapControls.locale";
import { useReportToolsFrTranslations } from "@/hooks/reports/locale/useReportTools.locale";
import { useDeleteReportFrTranslations } from "@/hooks/reports/locale/useDeleteReport.locale";
import { FeatureTypeLayerLegendsFrTranslations } from "@/features/navigation/layers/legends/locale/FeatureTypeLayerLegends.locale";
import { ShowFeatureTypeFormFrTranslations } from "@/features/working-layer/forms/locale/ShowFeatureTypeForm.locale";
import { EditFeatureTypeFormFrTranslations } from "@/features/working-layer/forms/locale/EditFeatureTypeForm.locale";
import { FeatureTypeFormActionsFrTranslations } from "@/features/working-layer/forms/locale/FeatureTypeFormActions.locale";
import { FeatureTypeFormFieldsFrTranslations } from "@/features/working-layer/forms/locale/FeatureTypeFormFields.locale";
import { FeatureTypeFormHeaderFrTranslations } from "@/features/working-layer/forms/locale/FeatureTypeFormHeader.locale";
import { FeatureTypeFormAutomaticFrTranslations } from "@/features/working-layer/forms/locale/FeatureTypeFormAutomatic.locale";
import { ClickableFeaturesModalFrTranslations } from "@/features/working-layer/modal/locale/ClickableFeaturesModal.locale";
import { FormAttachmentsFrTranslations } from "@/features/reports/forms/locale/FormAttachments.locale";
import { WorkingLayerControlFrTranslations } from "@/features/navigation/controls/locale/WorkingLayerControl.locale";
import { WorkingLayerLabelMapFrTranslations } from "@/features/navigation/controls/locale/WorkingLayerLabelMap.locale";
import { MesureLengthControlFrTranslations } from "@/features/navigation/controls/locale/MesureLengthControl.locale";
import { CustomControlsFrTranslations } from "@/features/navigation/controls/custom-controls/locale/index.locale";
import { ContributionListFrTranslations } from "@/features/contributions/locale/ContributionList.locale";
import { ContributionsConfirmResetFrTranslations } from "@/features/contributions/locale/ContributionsConfirmReset.locale";
import { ReviewContributionsFrTranslations } from "@/features/contributions/locale/ReviewContributions.locale";
import { ConfirmSaveContributionsFrTranslations } from "@/features/contributions/locale/ConfirmSaveContributions.locale";
import { ConfirmMultipleObjectsActionModalFrTranslations } from "@/features/working-layer/forms/locale/ConfirmMultipleObjectsActionModal.locale";
import { ConfirmMultipleDeselectionFrTranslations } from "@/features/navigation/controls/custom-controls/locale/ConfirmMultipleDeselection.locale";
import { ExportMapModalFrTranslations } from "@/features/navigation/controls/custom-controls/locale/ExportMapModal.locale";
import { useOperatorListFrTranslations } from "@/hooks/working-layer/locale/useOperatorList.locale";
import { SearchTableFrTranslations } from "@/features/working-layer/modal/searchObjects/locale/SearchTable.locale";
import { SearchObjectsModalFrTranslations } from "@/features/working-layer/modal/searchObjects/locale/SearchObjectsModal.locale";
import { GroupComponentFrTranslations } from "@/features/working-layer/modal/searchObjects/locale/GroupComponent.locale";
import { ConfirmDeleteObjectModalFrTranslations } from "@/features/working-layer/modal/searchObjects/locale/ConfirmDeleteObjectModal.locale";

export const translations: Translations<"fr"> = {
    AppFooter: AppFooterFrTranslations,
    AppHeader: AppHeaderFrTranslations,
    HeaderMenus: HeaderMenusFrTranslations,
    BetaBadge: BetaBadgeFrTranslations,
    CommunityTitle: CommunityTitleFrTranslations,
    CommunityToolbar: CommunityToolbarFrTranslations,
    DrawerComponent: DrawerComponentFrTranslations,
    FilterAndSortReport: FilterAndSortReportFrTranslations,
    ReportFiltersComponent: ReportFiltersComponentFrTranslations,
    NotFound: NotFoundFrTranslations,
    Carte: CarteFrTranslations,
    GetReportsLayer: GetReportsLayerFrTranslations,
    AttachmentList: AttachmentListFrTranslations,
    ConfirmCancelModal: ConfirmCancelModalFrTranslations,
    ConfirmDeleteReportModal: ConfirmDeleteReportModalFrTranslations,
    ShareReportModal: ShareReportModalFrTranslations,
    TableReportDrawer: TableReportDrawerFrTranslations,
    DrawingForm: DrawingFormFrTranslations,
    ImportSketchFile: ImportSketchFileFrTranslations,
    ReportForm: ReportFormFrTranslations,
    SketchList: SketchListFrTranslations,
    ThemeComponent: ThemeComponentFrTranslations,
    ThemeForm: ThemeFormFrTranslations,
    CenterMessage: CenterMessageFrTranslations,
    CreateReport: CreateReportFrTranslations,
    DeleteShareReportComponent: DeleteShareReportComponentFrTranslations,
    EditReport: EditReportFrTranslations,
    ReportDrawer: ReportDrawerFrTranslations,
    ShowReport: ShowReportFrTranslations,
    ConfirmDeleteShareReportModal: ConfirmDeleteShareReportModalFrTranslations,
    ReportTracking: ReportTrackingFrTranslations,
    useGetReportsLayer: useGetReportsLayerFrTranslations,
    useGetWFSLayer: useGetWFSLayerFrTranslations,
    useGetWMSLayer: useGetWMSLayerFrTranslations,
    useGetWMTSLayer: useGetWMTSLayerFrTranslations,
    useGetInteractionsFuncs: useGetInteractionsFuncsFrTranslations,
    useFeatureTypeValidation: useFeatureTypeValidationFrTranslations,
    DrawingControl: DrawingControlFrTranslations,
    ToolsControl: ToolsControlFrTranslations,
    CatalogControl: CatalogControlFrTranslations,
    CenterReportControl: CenterReportControlFrTranslations,
    useGetMapControls: useGetMapControlsFrTranslations,
    useReportTools: useReportToolsFrTranslations,
    useDeleteReport: useDeleteReportFrTranslations,
    FeatureTypeLayerLegends: FeatureTypeLayerLegendsFrTranslations,
    ShowFeatureTypeForm: ShowFeatureTypeFormFrTranslations,
    EditFeatureTypeForm: EditFeatureTypeFormFrTranslations,
    FeatureTypeFormActions: FeatureTypeFormActionsFrTranslations,
    FeatureTypeFormFields: FeatureTypeFormFieldsFrTranslations,
    FeatureTypeFormHeader: FeatureTypeFormHeaderFrTranslations,
    FeatureTypeFormAutomatic: FeatureTypeFormAutomaticFrTranslations,
    ClickableFeaturesModal: ClickableFeaturesModalFrTranslations,
    FormAttachments: FormAttachmentsFrTranslations,
    WorkingLayerControl: WorkingLayerControlFrTranslations,
    WorkingLayerLabelMap: WorkingLayerLabelMapFrTranslations,
    MesureLengthControl: MesureLengthControlFrTranslations,
    CustomControls: CustomControlsFrTranslations,
    ContributionList: ContributionListFrTranslations,
    ContributionsConfirmReset: ContributionsConfirmResetFrTranslations,
    ReviewContributions: ReviewContributionsFrTranslations,
    ConfirmSaveContributions: ConfirmSaveContributionsFrTranslations,
    ConfirmMultipleObjectsActionModal: ConfirmMultipleObjectsActionModalFrTranslations,
    ConfirmMultipleDeselection: ConfirmMultipleDeselectionFrTranslations,
    ExportMapModal: ExportMapModalFrTranslations,
    useOperatorList: useOperatorListFrTranslations,
    SearchTable: SearchTableFrTranslations,
    SearchObjectsModal: SearchObjectsModalFrTranslations,
    GroupComponent: GroupComponentFrTranslations,
    ConfirmDeleteObjectModal: ConfirmDeleteObjectModalFrTranslations,
};
