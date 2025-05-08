import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserTable from "../../components/DataTable/UserTable";

function User() {
  return (
    <>
      <PageMeta
        title="User Overview"
        description="Manage your user information and settings."
      />
      <PageBreadcrumb
        pageTitle="User"
        description="Manage your user information and settings."
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6 max-w-full overflow-x-auto">
        <UserTable />
      </div>
    </>
  );
}

export default User;