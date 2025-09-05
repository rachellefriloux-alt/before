import * as Contacts from 'expo-contacts';
import { Platform } from 'react-native';

export interface ContactInfo {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: Array<{
    id: string;
    number: string;
    label: string;
  }>;
  emails?: Array<{
    id: string;
    email: string;
    label: string;
  }>;
  addresses?: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
  company?: string;
  jobTitle?: string;
  birthday?: string;
  note?: string;
  imageAvailable?: boolean;
  imageUri?: string;
  favorite?: boolean;
}

export interface ContactGroup {
  id: string;
  name: string;
  contactCount: number;
  contacts: ContactInfo[];
}

export class EnhancedContacts {
  private static instance: EnhancedContacts;
  private contactsCache: ContactInfo[] = [];
  private lastCacheUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): EnhancedContacts {
    if (!EnhancedContacts.instance) {
      EnhancedContacts.instance = new EnhancedContacts();
    }
    return EnhancedContacts.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting contacts permissions:', error);
      return false;
    }
  }

  async getAllContacts(): Promise<ContactInfo[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Contacts permissions not granted');
      }

      // Check if cache is still valid
      const now = Date.now();
      if (this.contactsCache.length > 0 && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
        return this.contactsCache;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.ID,
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Addresses,
          Contacts.Fields.Company,
          Contacts.Fields.JobTitle,
          Contacts.Fields.Birthday,
          Contacts.Fields.Note,
          Contacts.Fields.ImageAvailable,
          Contacts.Fields.Image,
          Contacts.Fields.IsFavorite,
        ],
      });

      if (data.length > 0) {
        this.contactsCache = data.map(contact => this.mapContactToInfo(contact));
        this.lastCacheUpdate = now;
      }

      return this.contactsCache;
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  async searchContacts(query: string): Promise<ContactInfo[]> {
    try {
      const contacts = await this.getAllContacts();
      if (!query.trim()) return contacts;

      const searchTerm = query.toLowerCase();
      return contacts.filter(contact => {
        const nameMatch = contact.name.toLowerCase().includes(searchTerm);
        const firstNameMatch = contact.firstName?.toLowerCase().includes(searchTerm);
        const lastNameMatch = contact.lastName?.toLowerCase().includes(searchTerm);
        const companyMatch = contact.company?.toLowerCase().includes(searchTerm);
        const phoneMatch = contact.phoneNumbers?.some(phone => 
          phone.number.includes(searchTerm)
        );
        const emailMatch = contact.emails?.some(email => 
          email.email.toLowerCase().includes(searchTerm)
        );

        return nameMatch || firstNameMatch || lastNameMatch || companyMatch || phoneMatch || emailMatch;
      });
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }

  async getContactGroups(): Promise<ContactGroup[]> {
    try {
      const contacts = await this.getAllContacts();
      const groups: { [key: string]: ContactInfo[] } = {};

      // Group by company
      contacts.forEach(contact => {
        const company = contact.company || 'No Company';
        if (!groups[company]) {
          groups[company] = [];
        }
        groups[company].push(contact);
      });

      // Group by first letter of name
      const alphabeticalGroups: { [key: string]: ContactInfo[] } = {};
      contacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!alphabeticalGroups[firstLetter]) {
          alphabeticalGroups[firstLetter] = [];
        }
        alphabeticalGroups[firstLetter].push(contact);
      });

      // Group by favorite status
      const favoriteGroup = contacts.filter(contact => contact.favorite);
      if (favoriteGroup.length > 0) {
        groups['Favorites'] = favoriteGroup;
      }

      // Group by favorites
      const favoriteGroup = contacts.filter(contact => contact.favorite);
      if (favoriteGroup.length > 0) {
        groups['Favorites'] = favoriteGroup;
      }

      return Object.entries(groups).map(([name, contacts]) => ({
        id: name,
        name,
        contactCount: contacts.length,
        contacts,
      }));
    } catch (error) {
      console.error('Error getting contact groups:', error);
      return [];
    }
  }

  async getContactById(id: string): Promise<ContactInfo | null> {
    try {
      const contacts = await this.getAllContacts();
      return contacts.find(contact => contact.id === id) || null;
    } catch (error) {
      console.error('Error getting contact by ID:', error);
      return null;
    }
  }

  async getFavorites(): Promise<ContactInfo[]> {
    try {
      const contacts = await this.getAllContacts();
      return contacts.filter(contact => contact.favorite);
    } catch (error) {
      console.error('Error getting favorite contacts:', error);
      return [];
    }
  }

  async getRecentContacts(limit: number = 10): Promise<ContactInfo[]> {
    try {
      const contacts = await this.getAllContacts();
      // Return most recently added contacts (by id order)
      return contacts.slice(-limit).reverse();
    } catch (error) {
      console.error('Error getting recent contacts:', error);
      return [];
    }
  }

  async addContact(contactData: Partial<ContactInfo>): Promise<ContactInfo | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Contacts permissions not granted');
      }

      // This would require additional implementation for actually adding contacts
      // For now, we'll return null as this is a read-only implementation
      console.log('Adding contact:', contactData);
      return null;
    } catch (error) {
      console.error('Error adding contact:', error);
      return null;
    }
  }

  async updateContact(id: string, updates: Partial<ContactInfo>): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Contacts permissions not granted');
      }

      // This would require additional implementation for actually updating contacts
      // For now, we'll return false as this is a read-only implementation
      console.log('Updating contact:', id, updates);
      return false;
    } catch (error) {
      console.error('Error updating contact:', error);
      return false;
    }
  }

  private mapContactToInfo(contact: any): ContactInfo {
    return {
      id: contact.id,
      name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumbers: contact.phoneNumbers?.map((phone: any) => ({
        id: phone.id,
        number: phone.number,
        label: phone.label,
      })),
      emails: contact.emails?.map((email: any) => ({
        id: email.id,
        email: email.email,
        label: email.label,
      })),
      addresses: contact.addresses?.map((address: any) => ({
        id: address.id,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      })),
      company: contact.company,
      jobTitle: contact.jobTitle,
      birthday: contact.birthday,
      note: contact.note,
      imageAvailable: contact.imageAvailable,
      imageUri: contact.image?.uri,
      favorite: contact.favorite,
    };
  }

  clearCache(): void {
    this.contactsCache = [];
    this.lastCacheUpdate = 0;
  }
}

export default EnhancedContacts;
