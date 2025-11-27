import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";
import { JSX } from "react";

export const ReportFormFrTranslations: Translations<"fr">["ReportForm"] = {
    edit_report_title: ({ reportId }: { reportId: number }) => `Signalement ${reportId}`,
    create_report_title: "Soumettre un signalement",
    localize_report_alert:
        "Si vous ne l’avez pas encore fait, localisez sur la carte l’endroit où effectuer un signalement, ou dessinez un croquis explicatif à cet endroit.",
    select_theme: "Choisir un thème *:",
    draw_sketch: "Dessiner un croquis",
    describe_report: "Décrire le signalement",
    describe_report_label: "Explicitez votre signalement de façon la plus détaillée possible :",
    no_description: "Aucune description ajoutée",
    no_document: "Aucun document ajouté",
    import_attachments: "Joindre des documents",
    import_attachments_label: "Aidez nous à comprendre votre signalement. Ajouter par exemple des photos ou autres documents pour préciser votre message.",
    import_attachments_hint: ({ maxSizeMB }: { maxSizeMB: number }) => `Taille maximale : ${maxSizeMB} Mo. Formats supportés : JPG, PNG, PDF`,
    report_note: (
        <div className="note">
            <p>Si votre signalement ne concerne pas les thèmes ou données de ce guichet :</p>
            <a href="http://" target="_blank" rel="noopener noreferrer">
                Signalement hors guichet
            </a>
        </div>
    ),
    send_report: "Envoyer le signalement",
    submit_report: "Enregistrer",
    hide_toEdit: "Annuler",
    show_toEdit: "Modifier",
    show_toCreate: "Ajouter",
    cancel_report: "Annuler",
    delete_report: "Supprimer",
    save_report: "Enregistrer",
    all_fields_error: "Tous les champs",
    all_fields_error_message: "Merci de remplir tous les champs obligatoire",
    select_theme_error_message: "Vous devez obligatoirement choisir un thème et ses attributs pour envoyer un signalement",
    import_file_error_message_type: `Formats supportés : JPG, PNG, PDF`,
    import_file_error_message_size: ({ maxSizeMB }: { maxSizeMB: number }) => `Taille maximale : ${maxSizeMB} Mo.`,
    report_tracking: "Suivi",
    report_status: "Statut",
    report_content: "Votre message",
    report_send: "Envoyer",
    report_reply: "Répondre",
};

export const ReportFormEnTranslations: Translations<"en">["ReportForm"] = {
    edit_report_title: ({ reportId }: { reportId: number }) => `Report ${reportId}`,
    create_report_title: "Submit a report",
    localize_report_alert:
        "If you haven't already done so, locate on the map the place where you want to report, or draw an explanatory sketch at that location.",
    select_theme: "Choose a theme *:",
    draw_sketch: "Draw a sketch",
    describe_report: "Describe the report",
    describe_report_label: "Explain your report in as much detail as possible:",
    no_description: "No description added",
    no_document: "No document added",
    import_attachments: "Attach documents",
    import_attachments_label: "Help us understand your report. For example, add photos or other documents to clarify your message.",
    import_attachments_hint: ({ maxSizeMB }: { maxSizeMB: number }) => `Maximum size: ${maxSizeMB} MB. Supported formats: JPG, PNG, PDF`,
    report_note: (
        <div className="note">
            <p>If your report does not concern the topics or data in this window:</p>
            <a href="http://" target="_blank" rel="noopener noreferrer">
                Reporting outside the community
            </a>
        </div>
    ),
    send_report: "Send the report",
    submit_report: "Save",
    hide_toEdit: "Cancel",
    show_toEdit: "Edit",
    show_toCreate: "Add",
    cancel_report: "Cancel",
    delete_report: "Delete",
    save_report: "Save",
    all_fields_error: "All fields",
    all_fields_error_message: "Please fill in all required fields.",
    select_theme_error_message: "You must choose a theme and its attributes to send a report",
    import_file_error_message_type: "Supported formats: JPG, PNG, PDF",
    import_file_error_message_size: ({ maxSizeMB }: { maxSizeMB: number }) => `Maximum size: ${maxSizeMB} MB.`,
    report_tracking: "Tracking",
    report_status: "Status",
    report_content: "Your message",
    report_send: "Send",
    report_reply: "Reply",
};

const { i18n } = declareComponentKeys<
    | { K: "edit_report_title"; P: { reportId: number }; R: string }
    | "create_report_title"
    | "localize_report_alert"
    | "select_theme"
    | "draw_sketch"
    | "describe_report"
    | "describe_report_label"
    | "no_description"
    | "no_document"
    | "import_attachments"
    | "import_attachments_label"
    | { K: "import_attachments_hint"; P: { maxSizeMB: number }; R: string }
    | { K: "report_note"; R: JSX.Element }
    | "submit_report"
    | "send_report"
    | "hide_toEdit"
    | "show_toEdit"
    | "show_toCreate"
    | "cancel_report"
    | "delete_report"
    | "save_report"
    | "all_fields_error"
    | "all_fields_error_message"
    | "select_theme_error_message"
    | "import_file_error_message_type"
    | { K: "import_file_error_message_size"; P: { maxSizeMB: number }; R: string }
    | "report_tracking"
    | "report_status"
    | "report_content"
    | "report_send"
    | "report_reply"
>()("ReportForm");
export type I18n = typeof i18n;
