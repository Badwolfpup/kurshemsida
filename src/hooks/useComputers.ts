import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComputers,
  getComputerAssignments,
  addComputer,
  removeComputer,
  setComputerOwner,
  assignComputerSlot,
  clearComputerSlot,
} from "@/api/ComputerService";

/** SCENARIO: Admin/Teacher fetches the computer pool */
export function useComputers() {
  return useQuery({ queryKey: ["computers"], queryFn: getComputers, staleTime: 30_000 });
}

/** SCENARIO: Admin/Teacher fetches all shared-computer day/period assignments */
export function useComputerAssignments() {
  return useQuery({ queryKey: ["computer-assignments"], queryFn: getComputerAssignments, staleTime: 30_000 });
}

/**
 * SCENARIO: Admin/Teacher adds a computer to the pool by its id number
 * CALLS: POST /api/computers (ComputerEndpoints.cs)
 * SIDE EFFECTS: creates a Computer; invalidates ["computers"]
 */
export function useAddComputer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (number: number) => addComputer(number),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["computers"] }),
  });
}

/**
 * SCENARIO: Admin/Teacher removes a computer from the pool
 * CALLS: DELETE /api/computers/:id (ComputerEndpoints.cs)
 * SIDE EFFECTS: deletes the Computer (cascades its slots); invalidates ["computers"] + ["computer-assignments"]
 */
export function useRemoveComputer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeComputer(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["computers"] });
      void qc.invalidateQueries({ queryKey: ["computer-assignments"] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher dedicates a computer to one student (with take-home) or clears the owner
 * CALLS: PUT /api/computers/owner (ComputerEndpoints.cs)
 * SIDE EFFECTS: sets/clears owner + takesHome; clears the computer's shared slots when an owner is set;
 *               invalidates ["computers"] + ["computer-assignments"]
 */
export function useSetComputerOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setComputerOwner,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["computers"] });
      void qc.invalidateQueries({ queryKey: ["computer-assignments"] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher assigns a student to a shared computer for a day/period
 * CALLS: PUT /api/computer-assignments/assign (ComputerEndpoints.cs)
 * SIDE EFFECTS: upserts a ComputerAssignment; invalidates ["computer-assignments"]
 */
export function useAssignComputerSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignComputerSlot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["computer-assignments"] }),
  });
}

/**
 * SCENARIO: Admin/Teacher clears a shared computer's day/period slot
 * CALLS: DELETE /api/computer-assignments/clear (ComputerEndpoints.cs)
 * SIDE EFFECTS: removes a ComputerAssignment; invalidates ["computer-assignments"]
 */
export function useClearComputerSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearComputerSlot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["computer-assignments"] }),
  });
}
