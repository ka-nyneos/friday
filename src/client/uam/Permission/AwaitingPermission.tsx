import { useState, useEffect } from "react";
// import axios from "axios";
import { Suspense } from "react";
import TableContent from "./TableContent";
import LoadingSpinner from "../../ui/LoadingSpinner";

const AwaitingPermission: React.FC = () => {
  const [data, setData] = useState<PermissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSelected] = useState<boolean>(true);

  // Simulate data fetching (replace with your actual API call)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockData: PermissionData[] = [
          {
            RoleName: "Admin",
            UpdatedBy: "John Doe",
            UpdatedDate: "2024-01-15",
            Status: "Active",
          },
          {
            RoleName: "User",
            UpdatedBy: "Jane Smith",
            UpdatedDate: "2024-01-10",
            Status: "Pending",
          },
          {
            RoleName: "Manager",
            UpdatedBy: "Mike Johnson",
            UpdatedDate: "2024-01-12",
            Status: "Inactive",
          },
        ];

        setData(mockData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // If still loading, show spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render table content wrapped in Suspense
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TableContent
        data={data}
        searchTerm={searchTerm}
        showSelected={showSelected}
        onSearchChange={setSearchTerm}
      />
    </Suspense>
  );
};

export default AwaitingPermission;
