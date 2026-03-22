import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { dashboards, dashboardWidgets, files, parsedData } from '../db/schema.js';

export const dashboardService = {
  /**
   * List dashboards for an organization
   */
  async listDashboards(organizationId: string) {
    return db
      .select()
      .from(dashboards)
      .where(eq(dashboards.organizationId, organizationId))
      .orderBy(desc(dashboards.updatedAt));
  },

  /**
   * Get a single dashboard with its widgets
   */
  async getDashboard(dashboardId: string, organizationId: string) {
    const dashboard = await db.query.dashboards.findFirst({
      where: and(
        eq(dashboards.id, dashboardId),
        eq(dashboards.organizationId, organizationId),
      ),
    });

    if (!dashboard) throw new Error('Dashboard not found');

    const widgets = await db
      .select()
      .from(dashboardWidgets)
      .where(eq(dashboardWidgets.dashboardId, dashboardId))
      .orderBy(dashboardWidgets.createdAt);

    return { ...dashboard, widgets };
  },

  /**
   * Create a new dashboard
   */
  async createDashboard(
    organizationId: string,
    userId: string,
    data: { name: string; description?: string },
  ) {
    const [dashboard] = await db
      .insert(dashboards)
      .values({
        organizationId,
        createdById: userId,
        name: data.name,
        description: data.description,
      })
      .returning();

    return { ...dashboard, widgets: [] };
  },

  /**
   * Update a dashboard
   */
  async updateDashboard(
    dashboardId: string,
    organizationId: string,
    data: { name?: string; description?: string; layout?: Record<string, unknown> },
  ) {
    const [dashboard] = await db
      .update(dashboards)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(dashboards.id, dashboardId),
          eq(dashboards.organizationId, organizationId),
        ),
      )
      .returning();

    if (!dashboard) throw new Error('Dashboard not found');
    return dashboard;
  },

  /**
   * Delete a dashboard
   */
  async deleteDashboard(dashboardId: string, organizationId: string) {
    await db
      .delete(dashboards)
      .where(
        and(
          eq(dashboards.id, dashboardId),
          eq(dashboards.organizationId, organizationId),
        ),
      );

    return { success: true };
  },

  /**
   * Add a widget to a dashboard
   */
  async addWidget(
    dashboardId: string,
    organizationId: string,
    data: {
      type: 'chart' | 'table' | 'metric' | 'text';
      title: string;
      config: Record<string, unknown>;
      position: { x: number; y: number; w: number; h: number };
    },
  ) {
    // Verify dashboard belongs to org
    await this.getDashboard(dashboardId, organizationId);

    const [widget] = await db
      .insert(dashboardWidgets)
      .values({
        dashboardId,
        type: data.type,
        title: data.title,
        config: data.config,
        position: data.position,
      })
      .returning();

    return widget;
  },

  /**
   * Update a widget
   */
  async updateWidget(
    widgetId: string,
    dashboardId: string,
    data: {
      title?: string;
      config?: Record<string, unknown>;
      position?: { x: number; y: number; w: number; h: number };
    },
  ) {
    const [widget] = await db
      .update(dashboardWidgets)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(dashboardWidgets.id, widgetId),
          eq(dashboardWidgets.dashboardId, dashboardId),
        ),
      )
      .returning();

    if (!widget) throw new Error('Widget not found');
    return widget;
  },

  /**
   * Delete a widget
   */
  async deleteWidget(widgetId: string, dashboardId: string) {
    await db
      .delete(dashboardWidgets)
      .where(
        and(
          eq(dashboardWidgets.id, widgetId),
          eq(dashboardWidgets.dashboardId, dashboardId),
        ),
      );

    return { success: true };
  },

  /**
   * Get parsed data for chart rendering
   */
  async getChartData(fileId: string, organizationId: string) {
    const data = await db.query.parsedData.findFirst({
      where: and(
        eq(parsedData.fileId, fileId),
        eq(parsedData.organizationId, organizationId),
      ),
    });

    if (!data) throw new Error('Parsed data not found');

    return {
      columns: data.columns,
      rows: data.sampleData,
      rowCount: data.rowCount,
    };
  },
};
