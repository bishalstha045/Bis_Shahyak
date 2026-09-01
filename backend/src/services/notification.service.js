import { Notification } from '../models/Notification.js';
import { isDbConnected } from '../config/db.js';

const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'qco',
    badge: 'MANDATORY QCO ORDER',
    badge_class: 'bg-rose-50 text-rose-700 border-rose-200',
    title: 'Quality Control Order Enforcement: IS 17803:2022 (Stainless Steel Water Bottles)',
    authority: 'Ministry of Commerce & Industry (DPIIT) • Gazette S.O. 4521(E)',
    date: '28 Aug 2026',
    unread: true,
    impact: 'High Impact on Registered Product',
    description: 'Mandatory BIS ISI certification deadline has been confirmed for 15 October 2026. Production, stocking, or sale of non-ISI marked stainless steel bottles is prohibited under Section 16 of the BIS Act 2016.',
    action_primary: { label: 'Check Readiness (68%) →', target: 'compliance' },
    action_secondary: { label: 'Ask AI About Grace Period', query: 'What is the grace period and penalty for non-compliance under IS 17803:2022 QCO?' }
  },
  {
    id: 'notif-2',
    type: 'amendments',
    badge: 'TECHNICAL AMENDMENT',
    badge_class: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Amendment No. 1 to IS 17803:2022 Published by MED-18',
    authority: 'Bureau of Indian Standards • Mechanical Engineering Department',
    date: '21 Aug 2026',
    unread: true,
    impact: 'Direct Requirement Change',
    description: 'Clause 5.2.1 migration test limits for heavy metals (Lead & Cadmium) have been updated to align with global food-contact safety standards (ISO 8124). Testing protocols for caps and seals have been refined.',
    action_primary: { label: 'Compare Standard Diff →', target: 'compare' },
    action_secondary: { label: 'Ask AI Details', query: 'Explain the changes in Amendment No. 1 of IS 17803:2022 and how it affects manufacturer testing.' }
  },
  {
    id: 'notif-3',
    type: 'impact',
    badge: 'ASSESSMENT GAP ALERT',
    badge_class: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Missing Evidence for Clause 5.2.1 Safety Performance Test',
    authority: 'BIS Sahayak Compliance Engine',
    date: '20 Aug 2026',
    unread: true,
    impact: 'Action Required',
    description: 'Your registered product "Stainless Steel Water Bottle" currently lacks an uploaded test report from a BIS-recognized NABL laboratory. Uploading this evidence will elevate your compliance readiness score from 68% to 88%.',
    action_primary: { label: 'Upload Test Report →', target: 'documents' },
    action_secondary: { label: 'View Checklist', target: 'compliance' }
  },
  {
    id: 'notif-4',
    type: 'labs',
    badge: 'LAB INFRASTRUCTURE',
    badge_class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: '4 New BIS-Recognized Testing Laboratories Empaneled',
    authority: 'BIS Central Marks Department (CMD-III)',
    date: '15 Aug 2026',
    unread: false,
    impact: 'Faster Testing Turnaround',
    description: 'Accredited NABL test facilities in Manesar, Bengaluru, Pune, and Ahmedabad have been approved for rapid turnaround sample testing for electrical appliances (IS 302-1) and consumer containers (IS 17803).',
    action_primary: { label: 'Ask AI for Lab Directory →', query: 'List BIS-recognized laboratories for testing stainless steel bottles and electrical appliances near Delhi NCR and Maharashtra.' },
    action_secondary: null
  },
  {
    id: 'notif-5',
    type: 'training',
    badge: 'MSME CAPACITY BUILDING',
    badge_class: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'National Virtual Workshop on BIS Conformity Assessment Scheme-I',
    authority: 'National Institute of Training for Standardization (NITS)',
    date: '10 Aug 2026',
    unread: false,
    impact: 'Capacity Building & Subsidies',
    description: 'Free interactive session for MSME manufacturers explaining Scheme of Inspection and Testing (STI), ManakOnline portal filing, and government testing fee concessions (up to 50% for Micro & Women enterprises).',
    action_primary: { label: 'Ask AI About MSME Concessions →', query: 'What are the BIS fee concessions and subsidies available for MSMEs under the ManakOnline scheme?' },
    action_secondary: null
  }
];

let memoryNotifications = [...SEED_NOTIFICATIONS];

export class NotificationService {
  async getAll({ type = 'all', unreadOnly = false }) {
    if (isDbConnected()) {
      const count = await Notification.countDocuments();
      if (count === 0) {
        await Notification.insertMany(SEED_NOTIFICATIONS);
      }

      const query = {};
      if (type && type !== 'all') query.type = type;
      if (unreadOnly) query.unread = true;

      return await Notification.find(query).sort({ createdAt: -1 });
    } else {
      let filtered = [...memoryNotifications];
      if (type && type !== 'all') filtered = filtered.filter(n => n.type === type);
      if (unreadOnly) filtered = filtered.filter(n => n.unread === true);
      return filtered;
    }
  }

  async markAsRead(id) {
    if (isDbConnected()) {
      return await Notification.findOneAndUpdate({ id }, { unread: false }, { new: true });
    } else {
      const found = memoryNotifications.find(n => n.id === id);
      if (found) found.unread = false;
      return found;
    }
  }

  async markAllAsRead() {
    if (isDbConnected()) {
      await Notification.updateMany({}, { unread: false });
    } else {
      memoryNotifications.forEach(n => n.unread = false);
    }
    return { success: true };
  }
}

export const notificationService = new NotificationService();
