import React, { useState } from 'react';
import { 
  Shield, UserCheck, Key, Lock, FileText, AlertTriangle, 
  CheckCircle2, Users, Database, ArrowUpDown, History 
} from 'lucide-react';
import { OrgMembership, OrgRole, AuditLogEntry, Department } from '../types';
import { GovernanceService } from '../services/governanceService';

interface Props {
  orgId: string;
  userEmail: string;
}

export const GovernanceAuditTab: React.FC<Props> = ({ orgId, userEmail }) => {
  const [members, setMembers] = useState<OrgMembership[]>(() => GovernanceService.getMembers(orgId));
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => GovernanceService.getAuditLogs(orgId));
  const [departments, setDepartments] = useState<Department[]>(() => GovernanceService.getDepartments(orgId));
  const [activeSubTab, setActiveSubTab] = useState<'rbac' | 'audit' | 'departments'>('rbac');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const handleRoleChange = (memberId: string, newRole: OrgRole) => {
    GovernanceService.updateMemberRole(orgId, memberId, newRole);
    setMembers(GovernanceService.getMembers(orgId));
    
    // Log audit event
    GovernanceService.logAudit({
      id: `audit_role_${Date.now()}`,
      organizationId: orgId,
      actorId: userEmail,
      actorName: userEmail,
      actorRole: 'admin',
      action: 'UPDATE_MEMBER_ROLE',
      resourceType: 'RBAC_MEMBERSHIP',
      resourceId: memberId,
      outcome: 'success',
      details: { memberId, newRole },
      ipAddress: '102.89.44.12',
      timestamp: new Date().toISOString(),
    });
    setAuditLogs(GovernanceService.getAuditLogs(orgId));
  };

  const filteredLogs = filterAction === 'ALL'
    ? auditLogs
    : auditLogs.filter(l => l.action.toLowerCase().includes(filterAction.toLowerCase()));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-brand-purple/20 text-purple-300 border border-brand-purple/30">
              Enterprise Governance & Security
            </span>
            <span className="text-xs text-gray-400 font-medium">Immutable Audit Trail • Strict RBAC</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Governance, Security & Audit Logs</h2>
          <p className="text-sm text-gray-400">
            Enforce multi-tenant access boundaries, role hierarchies (Owner, Admin, Manager, Member, Guest), and auditable event tracking.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveSubTab('rbac')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'rbac' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Role-Based Access</span>
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'audit' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
          <button
            onClick={() => setActiveSubTab('departments')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'departments' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Departments</span>
          </button>
        </div>
      </div>

      {/* RBAC Tab */}
      {activeSubTab === 'rbac' && (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-white text-base">Organization Members & Roles</h3>
              <p className="text-xs text-gray-400">Assign role boundaries with strict least-privilege enforcement.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 border border-white/10">
              {members.length} Total Members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="text-gray-400 border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Department</th>
                  <th className="py-2.5">Current Role</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Joined Date</th>
                  <th className="py-2.5 text-right">Modify Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-white/5">
                    <td className="py-3 font-semibold text-white">{member.username}</td>
                    <td className="py-3 font-mono text-gray-400">{member.email}</td>
                    <td className="py-3 text-gray-300">{member.departmentId || 'Unassigned'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        member.role === 'owner' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        member.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        member.role === 'manager' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-white/10 text-gray-300 border border-white/15'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(member.joinedAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as OrgRole)}
                        disabled={member.role === 'owner'}
                        className="bg-slate-950/80 border border-white/10 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-brand-cyan disabled:opacity-40"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                        <option value="guest">Guest</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-white text-base">Immutable Security Audit Logs</h3>
              <p className="text-xs text-gray-400">Chronological verification ledger of all autonomous agents and user administrative operations.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Filter:</span>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="bg-slate-950/80 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-cyan"
              >
                <option value="ALL">All Actions</option>
                <option value="UPGRADE">Billing & Subscriptions</option>
                <option value="ROLE">Role & RBAC Updates</option>
                <option value="AGENT">Agent Autonomy Executions</option>
                <option value="DENIED">Security Denials</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="text-gray-400 border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5">Timestamp</th>
                  <th className="py-2.5">Actor</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5">Action</th>
                  <th className="py-2.5">Resource</th>
                  <th className="py-2.5">Outcome</th>
                  <th className="py-2.5">IP / Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="py-2.5 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 font-bold text-white font-sans">{log.actorName}</td>
                    <td className="py-2.5 text-gray-300 font-sans">{log.actorRole}</td>
                    <td className="py-2.5 text-brand-cyan font-semibold">{log.action}</td>
                    <td className="py-2.5 text-gray-300 font-sans">{log.resourceType} ({log.resourceId})</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.outcome === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {log.outcome}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeSubTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-gray-400">{dept.id}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gray-300">
                  {dept.headcount} Members
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{dept.name}</h4>
              <div className="pt-2 border-t border-white/10 text-xs text-gray-300 space-y-1">
                <div>Allocated Budget: <strong className="text-brand-cyan">${dept.budgetAllocated.toLocaleString()}</strong></div>
                <div>Department Lead: <strong className="text-white">{dept.leaderId}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
