import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import NotificationTable from "../../components/DataTable/NotificationTable";

export default function Notification() {
    return (
        <>
        <PageMeta
            title="Notifications"
            description="See all your notifications about your repositories and workflows."
        />
        <PageBreadcrumb
            pageTitle="Notifications"
            description="See all your notifications about your repositories and workflows."
        />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6 max-w-full overflow-x-auto">
            <NotificationTable />
        </div>
        </>
    );
}
