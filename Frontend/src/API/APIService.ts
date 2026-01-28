import axios from "axios";
// Import the model service relation map JSON
import ModelServiceRelationMap from "../core/data/model_service_relation_map.json";

// ============================================================
// TYPES FOR CROSS-SERVICE RELATION MAPPING
// ============================================================

export interface RelationConfig {
  name: string;
  model: string;
  foreign_key?: string;
  type: 'belongsTo' | 'hasMany' | 'hasOne' | string;
}

export interface ModelConfig {
  service: string;
  route: string;
  default_field?: string;
  relations: RelationConfig[];
}

// Map structure: { Services: {...}, Models: {...} }
export interface ServiceRelationMap {
  Services: Record<string, string>;
  Models: Record<string, ModelConfig>;
}

// Type assertion for the imported JSON
const relationMap = ModelServiceRelationMap as any;

// Service URL getter - reads from JSON config
function getServiceUrl(serviceName: string): string | null {
  return relationMap.Services?.[serviceName] || null;
}

// ============================================================
// RELATION DEFINITION TYPES (Object Format)
// ============================================================

/**
 * 
 *  const risks = await this.api.getAllWithRelations({
    select:"id|subject|risk_owner_id",
    withRelations: [
      'owner:id|full_name.department:id|name.jobs:id|name'
      // 'owner:id|full_name|department_id.department:id|name|job_ids.jobs'
      // 'owner:id|full_name{filter=full_name|AmrGebrill|<>}.department:id|name.jobs:id|name{filter=code|Control Management / Internal Controls Department (employee)}'
      // 'owner:id|full_name{filter=full_name|AmrGebrill|!=}.department:id|name.jobs:id|name{filter=code|Control Management / Internal Controls Department (employee)}'
    ]
  });
  anthor way:
 * Object-based relation definition for cleaner syntax
 * @example
 * {
 *   with: {
 *     owner: {
 *       select: "id|full_name",
 *       filter: "full_name|AmrGebrill|<>",
 *       with: {
 *         department: {
 *           select: "id|name",
 *           with: {
 *             jobs: { 
 *               select: "id|name",
 *               filter: "code|someValue"
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
export interface RelationDefinition {
  select?: string | string[];    // Fields to select (string with | or array)
  filter?: string;               // Filter string (e.g., "field|value|operator")
  filterIn?: string;             // FilterIn string
  perPage?: number;              // Limit results
  with?: Record<string, RelationDefinition>; // Nested relations
  [key: string]: any;            // Allow other params
}

export interface RelationObjectInput {
  with: Record<string, RelationDefinition>;
}

export type RelationInput = string | RelationObjectInput;

// ============================================================
// HELPER FUNCTIONS FOR SERVICE CONFIG
// ============================================================

/**
 * Get service configuration for a model
 * @param modelName - The model name (e.g., 'User', 'Department')
 * @returns Service route and base URL, or null if not found
 */
export function getServiceConfig(modelName: string): { route: string; baseUrl: string } | null {
  const modelConfig = relationMap.Models?.[modelName];
  if (!modelConfig || !modelConfig.service) return null;
  
  const serviceUrl = getServiceUrl(modelConfig.service);
  if (!serviceUrl) return null;

  return {
    route: modelConfig.route,
    baseUrl: serviceUrl,
  };
}

/**
 * Get relation configuration for a model's relation
 * @param modelName - The parent model name
 * @param relationName - The relation name (e.g., 'owner', 'department')
 * @returns Relation config or null if not found
 */
export function getRelationConfig(
  modelName: string,
  relationName: string
): RelationConfig | null {
  const modelConfig = relationMap.Models[modelName];
  if (!modelConfig) return null;

  const relation = modelConfig.relations.find(
    (r: any) => r.name === relationName
  );
  return relation || null;
}

// ============================================================
// API SERVICE BASE CLASS
// ============================================================

export default class APIService {
  protected route: string = '';

  // ============================================================
  // CROSS-SERVICE NESTED RELATIONS LOADING
  // ============================================================

  /**
   * Get all records with cross-service nested relations
   * 
   * @example
   * // String format (original)
   * await api.getAllWithRelations({ 
   *   withRelations: ['owner:id|full_name.department:id|name.jobs:id|name']
   * });
   * 
   * // Object format (new)
   * await api.getAllWithRelations({
   *   withRelations: [
   *     {
   *       with: {
   *         owner: {
   *           select: "id|full_name",
   *           filter: "full_name|AmrGebrill|<>",
   *           with: {
   *             department: {
   *               select: "id|name",
   *               with: {
   *                 jobs: { select: "id|name" }
   *               }
   *             }
   *           }
   *         }
   *       }
   *     }
   *   ]
   * });
   * 
   * @param params - Query parameters including 'withRelations' for nested loading
   * @param getAll - The getAll function from the API class
   * @returns Data with nested relations populated
   */
  async getAllWithRelations(
    params: Record<string, any> | undefined,
    getAll: (params?: Record<string, any>) => Promise<any>
  ): Promise<any> {
    try {
      // Extract withRelations from params (our custom cross-service relations)
      const withRelations: RelationInput[] = params?.withRelations || [];
      const cleanParams = { ...params };
      delete cleanParams.withRelations;

      // Get initial data from primary service
      const response = await getAll(cleanParams);
      
      if (!response || !Array.isArray(response) || response.length === 0) {
        return response;
      }

      // Process each relation (string or object format)
      for (const relationDef of withRelations) {
        if (typeof relationDef === 'string') {
          // Original string format: 'owner:id|full_name.department:id|name'
          await this.loadNestedRelation(response, relationDef, this.getModelName());
        } else if (relationDef.with) {
          // New object format: { with: { owner: { select: "...", with: {...} } } }
          await this.loadRelationsFromObjectFormat(response, relationDef.with, this.getModelName());
        }
      }

      return response;
    } catch (error: any) {
      console.error('Error in getAllWithRelations:', error);
      throw error;
    }
  }

  /**
   * Load relations from object format
   * Processes all relations defined in the 'with' object
   * 
   * @example
   * {
   *   owner: {
   *     select: "id|full_name",
   *     filter: "status|active",
   *     with: {
   *       department: {
   *         select: "id|name",
   *         with: {
   *           jobs: { select: "id|name" }
   *         }
   *       }
   *     }
   *   },
   *   department: { select: "id|name" }
   * }
   */
  protected async loadRelationsFromObjectFormat(
    data: any[],
    relations: Record<string, RelationDefinition>,
    currentModel: string
  ): Promise<void> {
    for (const [relationName, relationDef] of Object.entries(relations)) {
      await this.loadSingleRelationFromObject(data, relationName, relationDef, currentModel);
    }
  }

  /**
   * Load a single relation from object definition
   * Supports cleaner object-based syntax for defining relations
   * 
   * @example
   * // RelationDef for 'owner':
   * {
   *   select: "id|full_name",
   *   filter: "status|active",
   *   with: {
   *     department: {
   *       select: "id|name",
   *       with: {
   *         jobs: { select: "id|name" }
   *       }
   *     }
   *   }
   * }
   */
  protected async loadSingleRelationFromObject(
    data: any[],
    relationName: string,
    relationDef: RelationDefinition,
    currentModel: string
  ): Promise<void> {
    // Get relation configuration from JSON config
    const relationInfo = getRelationConfig(currentModel, relationName);
    if (!relationInfo) {
      console.warn(`Unknown relation: ${relationName} on model ${currentModel}`);
      return;
    }

    const targetModel = relationInfo.model;
    const foreignKey = relationInfo.foreign_key;
    const relationType = relationInfo.type;

    // Skip if no foreign key defined
    if (!foreignKey) {
      console.warn(`No foreign_key defined for relation: ${relationName} on model ${currentModel}`);
      return;
    }

    // Parse select fields - support both string and array format
    let finalSelectFields: string[] | null = null;
    if (relationDef.select) {
      if (typeof relationDef.select === 'string') {
        // String format: "id|full_name" or "id,full_name"
        finalSelectFields = relationDef.select.includes('|') 
          ? relationDef.select.split('|') 
          : relationDef.select.split(',');
      } else {
        finalSelectFields = [...relationDef.select];
      }
    }

    // If there are nested relations (with), ensure their foreign keys are included
    if (finalSelectFields && relationDef.with) {
      for (const nestedRelationName of Object.keys(relationDef.with)) {
        const nestedRelationInfo = getRelationConfig(targetModel, nestedRelationName);
        if (nestedRelationInfo?.foreign_key && !finalSelectFields.includes(nestedRelationInfo.foreign_key)) {
          finalSelectFields.push(nestedRelationInfo.foreign_key);
        }
      }
    }

    // Always ensure 'id' is included in select fields
    if (finalSelectFields && !finalSelectFields.includes('id')) {
      finalSelectFields.unshift('id');
    }

    // Check if this is a reverse hasMany (foreign key on child, not parent)
    const isReverse = this.isReverseHasMany(data, foreignKey, relationType);

    // Collect foreign key values or parent IDs for reverse hasMany
    let foreignKeyValues: any[];
    let filterField: string;

    if (isReverse) {
      // Reverse hasMany: collect parent IDs and filter children by foreign key
      foreignKeyValues = data.map(item => item.id || item._id).filter(Boolean);
      filterField = foreignKey;
      // Ensure foreign key is included in select for mapping
      if (finalSelectFields && !finalSelectFields.includes(foreignKey)) {
        finalSelectFields.push(foreignKey);
      }
    } else {
      // Normal relationship: extract foreign key values from data
      foreignKeyValues = this.extractForeignKeys(data, foreignKey, relationType);
      filterField = 'id';
    }
    
    if (foreignKeyValues.length === 0) {
      return;
    }

    // Build additional params from relationDef (filter, filterIn, perPage, etc.)
    const additionalParams: Record<string, any> = {};
    const reservedKeys = ['select', 'with'];
    for (const [key, value] of Object.entries(relationDef)) {
      if (!reservedKeys.includes(key) && value !== undefined) {
        additionalParams[key] = value;
      }
    }

    // Fetch related data from the target service
    const relatedData = await this.fetchFromService(
      targetModel, 
      foreignKeyValues, 
      finalSelectFields, 
      Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
      filterField
    );

    // Map related data back to parent records
    this.mapRelatedData(data, relatedData, relationName, foreignKey, relationType, isReverse);

    // Process nested relations if any
    if (relationDef.with && relatedData.length > 0) {
      // Get all nested objects to process
      const nestedData = data
        .map(item => item[relationName])
        .filter(Boolean)
        .flat();

      // Process each nested relation recursively
      await this.loadRelationsFromObjectFormat(nestedData, relationDef.with, targetModel);
    }
  }

  /**
   * Load a nested relation path (e.g., 'owner.department.parent' or 'owner:id,full_name.department:id,name')
   * Recursively loads each level of the relation
   * Supports field selection with colon syntax: 'relation:field1,field2' or 'relation:field1|field2'
   * Supports params with curly braces: 'relation:fields{filter=status|active,perPage=100}'
   * 
   * @example
   * // Basic nested relation
   * 'owner.department.jobs'
   * 
   * // With field selection
   * 'owner:id|full_name|department_id.department:id|name'
   * 
   * // With params/filters
   * 'owner:id|full_name{filter=status|active}.department:id|name.jobs:id|name{filter=is_active|1}'
   */
  protected async loadNestedRelation(
    data: any[],
    relationPath: string,
    currentModel: string
  ): Promise<void> {
    const parts = relationPath.split('.');
    const currentPart = parts[0];
    const remainingPath = parts.slice(1).join('.');

    // Parse relation name, select fields, and params
    // Support syntax: 'relation:fields{param=value,param2=value2}'
    const { relationName, selectFields, relationParams } = this.parseRelationPart(currentPart);

    // Get relation configuration from JSON config
    const relationInfo = getRelationConfig(currentModel, relationName);
    if (!relationInfo) {
      console.warn(`Unknown relation: ${relationName} on model ${currentModel}`);
      return;
    }

    const targetModel = relationInfo.model;
    const foreignKey = relationInfo.foreign_key;
    const relationType = relationInfo.type;

    // Skip if no foreign key defined
    if (!foreignKey) {
      console.warn(`No foreign_key defined for relation: ${relationName} on model ${currentModel}`);
      return;
    }

    // Clone selectFields to avoid mutating the original
    let finalSelectFields = selectFields ? [...selectFields] : null;

    // If there are remaining nested relations, ensure their foreign keys are included in select
    if (finalSelectFields && remainingPath) {
      const nextPart = remainingPath.split('.')[0];
      const { relationName: nextRelation } = this.parseRelationPart(nextPart);
      const nextRelationInfo = getRelationConfig(targetModel, nextRelation);
      
      if (nextRelationInfo?.foreign_key) {
        // Ensure the foreign key for the next relation is included
        if (!finalSelectFields.includes(nextRelationInfo.foreign_key)) {
          finalSelectFields.push(nextRelationInfo.foreign_key);
        }
      }
    }

    // Always ensure 'id' is included in select fields if selecting specific fields
    if (finalSelectFields && !finalSelectFields.includes('id')) {
      finalSelectFields.unshift('id');
    }

    // Check if this is a reverse hasMany (foreign key on child, not parent)
    const isReverse = this.isReverseHasMany(data, foreignKey, relationType);

    // Collect foreign key values or parent IDs for reverse hasMany
    let foreignKeyValues: any[];
    let filterField: string;

    if (isReverse) {
      // Reverse hasMany: collect parent IDs and filter children by foreign key
      foreignKeyValues = data.map(item => item.id || item._id).filter(Boolean);
      filterField = foreignKey;
      // Ensure foreign key is included in select for mapping
      if (finalSelectFields && !finalSelectFields.includes(foreignKey)) {
        finalSelectFields.push(foreignKey);
      }
    } else {
      // Normal relationship: extract foreign key values from data
      foreignKeyValues = this.extractForeignKeys(data, foreignKey, relationType);
      filterField = 'id';
    }
    
    if (foreignKeyValues.length === 0) {
      return;
    }

    // Fetch related data from the target service with optional field selection and params
    const relatedData = await this.fetchFromService(targetModel, foreignKeyValues, finalSelectFields, relationParams, filterField);

    // Map related data back to parent records
    this.mapRelatedData(data, relatedData, relationName, foreignKey, relationType, isReverse);

    // If there's more nesting, continue recursively
    if (remainingPath && relatedData.length > 0) {
      // Get all nested objects to process
      const nestedData = data
        .map(item => item[relationName])
        .filter(Boolean)
        .flat();
      
      await this.loadNestedRelation(nestedData, remainingPath, targetModel);
    }
  }

  /**
   * Parse a relation part to extract relation name, select fields, and params
   * Supports formats:
   * - 'relation'
   * - 'relation:field1|field2'
   * - 'relation{param=value}'
   * - 'relation:field1|field2{param=value,param2=value2}'
   */
  protected parseRelationPart(part: string): {
    relationName: string;
    selectFields: string[] | null;
    relationParams: Record<string, any>;
  } {
    let relationName = part;
    let selectFields: string[] | null = null;
    const relationParams: Record<string, any> = {};

    // Extract params from curly braces {param=value,param2=value2}
    const paramsMatch = part.match(/\{([^}]+)\}/);
    if (paramsMatch) {
      const paramsStr = paramsMatch[1];
      // Parse params: key=value pairs separated by comma
      // Only split on first '=' to preserve '=' in values (like 'filter=name|value|!=')
      paramsStr.split(',').forEach(param => {
        const eqIndex = param.indexOf('=');
        if (eqIndex > -1) {
          const key = param.substring(0, eqIndex).trim();
          const value = param.substring(eqIndex + 1).trim();
          if (key && value !== undefined) {
            relationParams[key] = value;
          }
        }
      });
      // Remove params part from the string
      relationName = part.replace(/\{[^}]+\}/, '');
    }

    // Extract select fields from colon syntax
    const colonIndex = relationName.indexOf(':');
    if (colonIndex > -1) {
      const selectFieldsStr = relationName.substring(colonIndex + 1);
      relationName = relationName.substring(0, colonIndex);
      
      // Parse select fields - support both comma and pipe separators
      if (selectFieldsStr) {
        selectFields = selectFieldsStr.includes('|') 
          ? selectFieldsStr.split('|') 
          : selectFieldsStr.split(',');
      }
    }

    return { relationName, selectFields, relationParams };
  }

  /**
   * Extract unique foreign key values from data array
   * For hasMany with foreign key on child (reverse), extracts parent IDs
   * For hasMany with foreign key on parent (array), extracts all referenced IDs
   * For belongsTo, extracts the foreign key value
   */
  protected extractForeignKeys(data: any[], foreignKey: string, relationType: string): any[] {
    const values = new Set<any>();

    data.forEach(item => {
      const value = item[foreignKey];
      if (value !== null && value !== undefined) {
        if (relationType === 'hasMany' && Array.isArray(value)) {
          // hasMany where parent has array of child IDs (e.g., job_ids: [1,2,3])
          value.forEach(v => values.add(v));
        } else {
          values.add(value);
        }
      } else if (relationType === 'hasMany') {
        // hasMany with foreign key on child side - use parent's ID
        const parentId = item.id || item._id;
        if (parentId) {
          values.add(parentId);
        }
      }
    });

    return Array.from(values);
  }

  /**
   * Check if this is a reverse hasMany (foreign key is on child, not parent)
   * Returns true if parent doesn't have the foreign_key field but children would reference parent
   */
  protected isReverseHasMany(data: any[], foreignKey: string, relationType: string): boolean {
    if (relationType !== 'hasMany') return false;
    
    // Check if any item has the foreignKey as an array - if so, it's normal hasMany
    // If no item has foreignKey or it's not an array, it's reverse hasMany
    return !data.some(item => Array.isArray(item[foreignKey]));
  }

  /**
   * Fetch data from a specific service by IDs
   * @param modelName - The model name to fetch
   * @param ids - Array of IDs to fetch
   * @param selectFields - Optional array of fields to select (e.g., ['id', 'name', 'email'])
   * @param additionalParams - Optional additional params to pass (e.g., { filter: 'status|active' })
   * @param filterField - Optional field to filter by (default: 'id', but can be foreign key for reverse hasMany)
   */
  protected async fetchFromService(
    modelName: string, 
    ids: any[], 
    selectFields?: string[] | null,
    additionalParams?: Record<string, any>,
    filterField: string = 'id'
  ): Promise<any[]> {
    const serviceInfo = getServiceConfig(modelName);
    
    if (!serviceInfo) {
      console.warn(`No service configuration found for model: ${modelName}`);
      return [];
    }

    try {
      const originalBaseUrl = axios.defaults.baseURL;
      axios.defaults.baseURL = serviceInfo.baseUrl;

      // Build params with optional select fields
      const params: Record<string, any> = {
        filterIn: `${filterField}|${ids.join(',')}`,
        perPage: ids.length + 100, // Ensure we get all (add buffer for hasMany)
      };

      // Add select fields if provided (use pipe syntax for backend compatibility)
      if (selectFields && selectFields.length > 0) {
        params.select = selectFields.join('|');
      }

      // Merge additional params (like filter, with, etc.)
      if (additionalParams && Object.keys(additionalParams).length > 0) {
        Object.assign(params, additionalParams);
      }

      // Batch fetch - use filterIn to get all records at once
      const response = await axios.get(`/${serviceInfo.route}`, { params });

      axios.defaults.baseURL = originalBaseUrl;

      // Handle both paginated and non-paginated responses
      const responseData = response.data?.data || response.data || [];
      return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
      console.error(`Error fetching from ${modelName} service:`, error);
      return [];
    }
  }

  /**
   * Map fetched related data back to parent records
   * Supports both normal hasMany (parent has array of IDs) and reverse hasMany (child has parent ID)
   */
  protected mapRelatedData(
    parentData: any[],
    relatedData: any[],
    relationName: string,
    foreignKey: string,
    relationType: string,
    isReverse: boolean = false
  ): void {
    if (isReverse && relationType === 'hasMany') {
      // Reverse hasMany: group children by their foreign key value (pointing to parent)
      const groupedByParent = new Map<string, any[]>();
      relatedData.forEach(item => {
        const parentId = String(item[foreignKey]);
        if (!groupedByParent.has(parentId)) {
          groupedByParent.set(parentId, []);
        }
        groupedByParent.get(parentId)!.push(item);
      });

      // Map grouped data to parent records
      parentData.forEach(item => {
        const parentId = String(item.id || item._id);
        item[relationName] = groupedByParent.get(parentId) || [];
      });
      return;
    }

    // Create a lookup map for O(1) access
    const relatedMap = new Map<string, any>();
    relatedData.forEach(item => {
      const id = item.id || item._id;
      if (id) {
        relatedMap.set(String(id), item);
      }
    });

    // Map related data to parent records
    parentData.forEach(item => {
      const fkValue = item[foreignKey];
      
      if (fkValue === null || fkValue === undefined) {
        item[relationName] = relationType === 'hasMany' ? [] : null;
        return;
      }

      if (relationType === 'hasMany' && Array.isArray(fkValue)) {
        // For hasMany, map array of IDs to array of objects
        item[relationName] = fkValue
          .map(id => relatedMap.get(String(id)))
          .filter(Boolean);
      } else {
        // For belongsTo, map single ID to single object
        item[relationName] = relatedMap.get(String(fkValue)) || null;
      }
    });
  }

  /**
   * Get model name from route (e.g., 'risk' -> 'Risk')
   */
  protected getModelName(): string {
    // Handle hyphenated routes (e.g., 'risk-taxonomy' -> 'RiskTaxonomy')
    return this.route
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * Parallel loading of multiple independent relations
   * More efficient when loading multiple unrelated paths
   */
  async getAllWithRelationsParallel(
    params: Record<string, any> | undefined,
    getAll: (params?: Record<string, any>) => Promise<any>
  ): Promise<any> {
    try {
      const withRelations: string[] = params?.withRelations || [];
      const cleanParams = { ...params };
      delete cleanParams.withRelations;

      // Get initial data
      const response = await getAll(cleanParams);
      
      if (!response?.data || !Array.isArray(response.data) || response.data.length === 0) {
        return response;
      }

      // Group relations by first level for parallel loading
      const firstLevelRelations: string[] = [...new Set(withRelations.map((r: string) => r.split('.')[0]))];
      
      // Load first level relations in parallel
      await Promise.all(
        firstLevelRelations.map((relation: string) => 
          this.loadNestedRelation(
            response.data, 
            withRelations.find((r: string) => r.startsWith(relation)) || relation,
            this.getModelName()
          )
        )
      );

      return response;
    } catch (error: any) {
      console.error('Error in getAllWithRelationsParallel:', error);
      throw error;
    }
  }

  /**
   * Get single record with cross-service nested relations
   * Supports both string and object formats
   */
  async showWithRelations(
    id: string,
    params: Record<string, any> | undefined,
    show: (id: string, params?: Record<string, any>) => Promise<any>
  ): Promise<any> {
    try {
      const withRelations: RelationInput[] = params?.withRelations || [];
      const cleanParams = { ...params };
      delete cleanParams.withRelations;

      // Get initial data
      const response = await show(id, cleanParams);
      
      if (!response?.data) {
        return response;
      }

      // Wrap single item in array for processing
      const dataArray = [response.data];

      // Process each relation (string or object format)
      for (const relationDef of withRelations) {
        if (typeof relationDef === 'string') {
          await this.loadNestedRelation(dataArray, relationDef, this.getModelName());
        } else if (relationDef.with) {
          // New object format: { with: { owner: { select: "...", with: {...} } } }
          await this.loadRelationsFromObjectFormat(dataArray, relationDef.with, this.getModelName());
        }
      }

      // Return with unwrapped data
      return { ...response, data: dataArray[0] };
    } catch (error: any) {
      console.error('Error in showWithRelations:', error);
      throw error;
    }
  }
}