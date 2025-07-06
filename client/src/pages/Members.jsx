import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { usersAPI } from "../services/api";
import MemberCard from "../components/MemberCard";

const Members = () => {
  const dispatch = useDispatch();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [emailSearchTerm, setEmailSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getAllUsers();
        setMembers(response.data.data);
        setFilteredMembers(response.data.data);

        // Extract all unique skills from members
        const skills = new Set();
        response.data.data.forEach((member) => {
          if (member.skills && Array.isArray(member.skills)) {
            member.skills.forEach((skill) => skills.add(skill));
          }
        });
        setAvailableSkills(Array.from(skills).sort());
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to load members. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [dispatch]);

  // Filter members based on search term and selected skill
  useEffect(() => {
    let result = [...members];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (member) =>
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term)
      );
    }

    if (selectedSkill) {
      result = result.filter(
        (member) =>
          member.skills &&
          member.skills.some((skill) => skill === selectedSkill)
      );
    }

    setFilteredMembers(result);
  }, [searchTerm, selectedSkill, members]);

  const handleEmailSearchChange = (e) => {
    setEmailSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSkill("");
    setEmailSearchTerm("");
    // Reset to all members
    setFilteredMembers(members);
  };

  const handleEmailSearch = async () => {
    if (!emailSearchTerm.trim()) {
      toast.warn("Please enter an email to search");
      return;
    }

    try {
      setIsSearching(true);
      const response = await usersAPI.searchUsersByEmail(emailSearchTerm);

      if (response.data && response.data.data) {
        setFilteredMembers(response.data.data);
        toast.success(
          `Found ${response.data.data.length} members matching "${emailSearchTerm}"`
        );
      } else {
        setFilteredMembers([]);
        toast.info("No members found matching that email");
      }
    } catch (error) {
      console.error("Error searching members by email:", error);
      toast.error("Failed to search members. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Team Members
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {filteredMembers.length}{" "}
          {filteredMembers.length === 1 ? "member" : "members"}
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">

        {/* Email search */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <label
            htmlFor="emailSearch"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search Specifically by Email
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              id="emailSearch"
              value={emailSearchTerm}
              onChange={handleEmailSearchChange}
              placeholder="Enter exact email to search"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleEmailSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {(searchTerm || selectedSkill || emailSearchTerm) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No members found matching your criteria.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <MemberCard key={member._id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Members;
